// Demo auth guard. The KDS prototype's login flows are mocked and accept
// any credentials. To prevent unauthenticated access in production builds,
// these mock success paths are gated to development-only.
//
// Replace this with real server-side authentication (Lovable Cloud / Supabase
// Auth, JWT, or your POS backend) before shipping to production users.

export const isDemoAuthAllowed = (): boolean => import.meta.env.DEV;

export const blockDemoAuthInProd = (): boolean => {
  if (isDemoAuthAllowed()) return true;
  if (typeof window !== 'undefined') {
    // eslint-disable-next-line no-alert
    window.alert(
      'Authentication backend is not connected. Sign-in is disabled in production builds until a real auth provider (Lovable Cloud / POS backend) is configured.'
    );
  }
  return false;
};

// Issue and validate short-lived tokens for the mobile reply (/kds-reply) flow.
// Tokens are stored in localStorage with an expiry timestamp. Without a
// matching, unexpired token, the reply page rejects submissions.
const REPLY_TOKEN_STORE = 'kds-reply-tokens';
const REPLY_TOKEN_TTL_MS = 10 * 60 * 1000; // 10 minutes

type ReplyTokenRecord = { messageId: string; token: string; expiresAt: number };

const readTokens = (): ReplyTokenRecord[] => {
  try {
    const raw = localStorage.getItem(REPLY_TOKEN_STORE);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeTokens = (tokens: ReplyTokenRecord[]) => {
  try {
    localStorage.setItem(REPLY_TOKEN_STORE, JSON.stringify(tokens));
  } catch {
    /* ignore quota errors */
  }
};

const randomToken = (): string => {
  if (typeof crypto !== 'undefined' && 'getRandomValues' in crypto) {
    const buf = new Uint8Array(16);
    crypto.getRandomValues(buf);
    return Array.from(buf).map(b => b.toString(16).padStart(2, '0')).join('');
  }
  return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
};

export const issueReplyToken = (messageId: string): { token: string; expiresAt: number } => {
  const now = Date.now();
  const token = randomToken();
  const expiresAt = now + REPLY_TOKEN_TTL_MS;
  const existing = readTokens().filter(t => t.expiresAt > now && t.messageId !== messageId);
  existing.push({ messageId, token, expiresAt });
  writeTokens(existing);
  return { token, expiresAt };
};

export const validateReplyToken = (messageId: string, token: string): boolean => {
  if (!messageId || !token) return false;
  const now = Date.now();
  const tokens = readTokens();
  const match = tokens.find(t => t.messageId === messageId && t.token === token);
  if (!match) return false;
  if (match.expiresAt <= now) return false;
  return true;
};

export const consumeReplyToken = (messageId: string, token: string): void => {
  const remaining = readTokens().filter(
    t => !(t.messageId === messageId && t.token === token)
  );
  writeTokens(remaining);
};

export const REPLY_TOKEN_TTL_SECONDS = REPLY_TOKEN_TTL_MS / 1000;
