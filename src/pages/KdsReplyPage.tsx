import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Send, CheckCircle } from 'lucide-react';
import { validateReplyToken, consumeReplyToken } from '@/lib/demo-auth';

const PRESET_REPLIES = [
  'Got it',
  'On its Way',
  '5 mins',
  'Need More Time',
  'Out of Stock',
  'Cooking Now',
];

const MAX_CHARS = 100;

export default function KdsReplyPage() {
  const [params] = useSearchParams();
  const messageId = params.get('messageId') || '';
  const token = params.get('token') || '';
  const [text, setText] = useState('');
  const [sent, setSent] = useState(false);

  const tokenValid = useMemo(
    () => validateReplyToken(messageId, token),
    [messageId, token]
  );

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    // Re-validate at submit time so an expired token can't slip through.
    if (!validateReplyToken(messageId, token)) return;
    const replies = JSON.parse(localStorage.getItem('kds-mobile-replies') || '[]');
    replies.push({
      messageId,
      text: trimmed,
      timestamp: new Date().toISOString(),
    });
    localStorage.setItem('kds-mobile-replies', JSON.stringify(replies));
    consumeReplyToken(messageId, token);
    setSent(true);
  };

  if (!messageId || !token || !tokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <p className="text-gray-500 text-sm">Invalid or expired reply link.</p>
      </div>
    );
  }

  if (sent) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 gap-4">
        <CheckCircle size={48} className="text-green-500" />
        <p className="text-lg font-bold text-gray-800">Reply sent!</p>
        <p className="text-sm text-gray-500">Your response has been recorded. You can close this page.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <h1 className="text-lg font-bold text-gray-900">Kitchen reply</h1>
        <p className="text-xs text-gray-500 mt-0.5">Message ID: {messageId}</p>
      </div>

      <div className="flex-1 p-4 flex flex-col gap-4">
        {/* Quick replies */}
        <div>
          <p className="text-xs font-semibold text-gray-500 mb-2">Quick replies</p>
          <div className="flex flex-wrap gap-2">
            {PRESET_REPLIES.map(preset => (
              <button
                key={preset}
                onClick={() => setText(preset)}
                className={`px-3.5 py-2 rounded-full text-sm font-semibold border transition-all
                  ${text === preset
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'bg-white text-gray-800 border-gray-300 active:bg-gray-100'
                  }`}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        {/* Free text */}
        <div>
          <textarea
            value={text}
            onChange={e => setText(e.target.value.slice(0, MAX_CHARS))}
            placeholder="Type a custom reply..."
            className="w-full h-28 px-3 py-2.5 text-base border border-gray-300 rounded-xl bg-white text-gray-900 resize-none focus:outline-none focus:ring-2 focus:ring-gray-400/40"
          />
          <p className="text-[10px] text-gray-400 text-right mt-1">
            {text.length}/{MAX_CHARS}
          </p>
        </div>
      </div>

      {/* Send button */}
      <div className="p-4 bg-white border-t border-gray-200">
        <button
          onClick={handleSend}
          disabled={!text.trim()}
          className="w-full py-3.5 rounded-xl bg-gray-900 text-white text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed active:bg-gray-800 transition-colors min-h-[48px]"
        >
          <Send size={16} />
          Send Reply
        </button>
      </div>
    </div>
  );
}
