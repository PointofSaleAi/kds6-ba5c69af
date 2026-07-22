import { useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, Mic, Monitor, ShoppingBag, Send, Cpu, Cog, User } from 'lucide-react';
import {
  SETTINGS_GROUPS,
  searchSettings,
  type SettingsGroupId,
} from '@/lib/settings-search-index';
import { SettingsIconTile } from './SettingsIconTile';
import { TicketsIcon } from '@/components/kds/icons/TicketsIcon';
import systemIcon from '@/assets/icons/settings-system.png';
import { useActiveIdentity, initialsFromName, colorFromString } from '@/hooks/use-active-identity';

const GROUP_ICON: Record<SettingsGroupId, typeof Monitor> = {
  display: Monitor,
  orders: ShoppingBag,
  expo: Send,
  hardware: Cpu,
  system: Cog,
  account: User,
};

export const GROUP_COLOR: Record<SettingsGroupId, string> = {
  display: '#525252',
  orders: '#F9900E',
  expo: '#7C3AED',
  hardware: '#5E4DD8',
  system: '#34A885',
  account: '#0A84FF',
};

export function SettingsSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [query, setQuery] = useState('');
  const { identity } = useActiveIdentity();

  const results = searchSettings(query);
  const showResults = query.trim().length > 0;

  const handleResultClick = (path: string) => {
    setQuery('');
    navigate(path);
  };

  const groupIds: SettingsGroupId[] = ['account', 'system', 'orders', 'hardware', 'display'];

  const isStaff = identity.kind === 'staff';
  const displayName = identity.name;
  const roleLabel = isStaff ? identity.role : 'Restaurant';
  const initials = useMemo(() => initialsFromName(displayName), [displayName]);
  const avatarBg = useMemo(
    () => colorFromString(displayName + (isStaff ? identity.role : '')),
    [displayName, identity, isStaff]
  );

  return (
    <aside className="flex flex-col shrink-0 h-full w-full">
      <div className="px-3.5 pt-3.5 pb-3 shrink-0">
        <h2 className="text-[1.65rem] font-bold" style={{ color: 'hsl(var(--text-primary))' }}>
          Settings
        </h2>

        <button
          type="button"
          onClick={() => navigate(SETTINGS_GROUPS.account.path)}
          className="mt-3 w-full flex items-center gap-3 rounded-2xl px-3 py-2.5 active:opacity-70 transition-all text-left"
          style={{
            background: 'hsl(var(--text-primary) / 0.06)',
            boxShadow: 'inset 0 0 0 0.5px hsl(var(--text-primary) / 0.06)',
          }}
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm font-montserrat shrink-0"
            style={{ background: avatarBg }}
          >
            {initials}
          </div>
          <div className="flex-1 min-w-0">
          <div
            className="text-[0.82rem] font-bold leading-tight truncate"
              style={{ color: 'hsl(var(--text-primary))' }}
            >
              {displayName}
            </div>
            <div
              className="text-[0.7rem] leading-tight truncate mt-0.5"
              style={{ color: 'hsl(var(--text-muted))' }}
            >
              {roleLabel}
            </div>
          </div>
        </button>
      </div>


      <div className="flex-1 overflow-y-auto scrollbar-hide px-3.5 pb-2">
        {showResults ? (
          <div>
            <div
              className="text-[0.7rem] font-medium tracking-wide px-3 py-2"
              style={{ color: 'hsl(var(--text-muted))' }}
            >
              {results.length} result{results.length === 1 ? '' : 's'}
            </div>
            {results.length === 0 && (
              <p className="text-[0.9rem] px-3 py-3" style={{ color: 'hsl(var(--text-muted))' }}>
                No matches. Try a different word.
              </p>
            )}
            {results.map((r) => {
              const Icon = GROUP_ICON[r.group];
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => handleResultClick(r.path)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl active:opacity-70 transition-all text-left"
                >
                  <div
                    className="flex items-center justify-center shrink-0"
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 8,
                      backgroundColor: GROUP_COLOR[r.group],
                      color: '#FFFFFF',
                    }}
                  >
                    {r.group === 'orders' ? (
                      <TicketsIcon size={20} className="text-white" />
                    ) : (
                      <Icon size={18} color="#FFFFFF" strokeWidth={2.2} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div
                      className="text-[0.9rem] font-medium leading-tight truncate"
                      style={{ color: 'hsl(var(--text-primary))' }}
                    >
                      {r.label}
                    </div>
                    <div
                      className="text-[0.7rem] leading-tight truncate"
                      style={{ color: 'hsl(var(--text-muted))' }}
                    >
                      {r.groupLabel} · {r.description}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <nav className="flex flex-col" style={{ gap: 1 }}>
            {groupIds.map((id) => {
              const group = SETTINGS_GROUPS[id];
              const Icon = GROUP_ICON[id];
              const isActive = location.pathname.startsWith(group.path);
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => navigate(group.path)}
                  className="flex items-center gap-2.5 w-full py-1 px-2 rounded-full active:opacity-70 transition-all"
                  style={{
                    background: isActive ? 'hsl(var(--surface-bg))' : 'transparent',
                  }}
                >
                  <SettingsIconTile
                    icon={Icon}
                    bgColor={GROUP_COLOR[id]}
                    size="xs"
                    iconSrc={id === 'system' ? systemIcon : undefined}
                    iconNode={id === 'orders' ? <TicketsIcon size={18} className="text-white" /> : undefined}
                  />
                  <span
                    className="text-[0.82rem] font-semibold leading-tight"
                    style={{ color: 'hsl(var(--text-primary))' }}
                  >
                    {group.label}
                  </span>
                </button>
              );
            })}
          </nav>
        )}
      </div>

      <div className="px-3.5 pt-3 pb-3 shrink-0">
        <div
          className="flex items-center gap-2 rounded-2xl px-3 py-[0.55rem] backdrop-blur-xl"
          style={{
            background: 'hsl(var(--text-primary) / 0.06)',
            boxShadow: 'inset 0 0 0 0.5px hsl(var(--text-primary) / 0.04)',
          }}
        >
          <Search className="w-[1.05rem] h-[1.05rem] shrink-0" style={{ color: 'hsl(var(--text-muted))' }} strokeWidth={2.5} />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search"
            className="bg-transparent flex-1 outline-none text-[0.95rem] font-normal leading-tight min-w-0 placeholder:font-normal placeholder:text-[hsl(var(--text-muted))] tracking-[-0.01em]"
            style={{ color: 'hsl(var(--text-primary))' }}
          />
          <button
            type="button"
            aria-label="Voice Search"
            className="shrink-0 active:opacity-60 transition-opacity"
          >
            <Mic className="w-[1.05rem] h-[1.05rem]" style={{ color: 'hsl(var(--text-muted))' }} strokeWidth={2.2} />
          </button>
        </div>
      </div>
    </aside>
  );
}

export default SettingsSidebar;
