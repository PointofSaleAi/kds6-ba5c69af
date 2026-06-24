import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, Mic, Monitor, ShoppingBag, Send, Cpu, User } from 'lucide-react';
import {
  SETTINGS_GROUPS,
  searchSettings,
  type SettingsGroupId,
} from '@/lib/settings-search-index';
import { SettingsIconTile } from './SettingsIconTile';

const GROUP_ICON: Record<SettingsGroupId, typeof Monitor> = {
  display: Monitor,
  orders: ShoppingBag,
  expo: Send,
  hardware: Cpu,
  account: User,
};

export const GROUP_COLOR: Record<SettingsGroupId, string> = {
  display: '#525252',
  orders: '#F9900E',
  expo: '#7C3AED',
  hardware: '#5E4DD8',
  account: '#0A84FF',
};

export function SettingsSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [query, setQuery] = useState('');

  const results = searchSettings(query);
  const showResults = query.trim().length > 0;

  const handleResultClick = (path: string) => {
    setQuery('');
    navigate(path);
  };

  const groupIds: SettingsGroupId[] = ['display', 'orders', 'hardware', 'account'];

  return (
    <aside className="flex flex-col shrink-0 h-full w-full">
      <div className="px-5 pt-5 pb-4 shrink-0">
        <h2 className="text-[2.25rem] font-bold leading-tight" style={{ color: 'hsl(var(--text-primary))' }}>
          Settings
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide px-3.5 pb-2">
        {showResults ? (
          <div>
            <div
              className="text-[0.7rem] font-medium uppercase tracking-wider px-3 py-2"
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
                    }}
                  >
                    <Icon size={18} color="#FFFFFF" strokeWidth={2.2} />
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
          <nav className="flex flex-col" style={{ gap: 4 }}>
            {groupIds.map((id) => {
              const group = SETTINGS_GROUPS[id];
              const Icon = GROUP_ICON[id];
              const isActive = location.pathname.startsWith(group.path);
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => navigate(group.path)}
                  className="flex items-center gap-4 w-full py-2.5 px-3 rounded-full active:opacity-70 transition-all"
                  style={{
                    background: isActive ? 'hsl(var(--surface-bg))' : 'transparent',
                  }}
                >
                  <SettingsIconTile icon={Icon} bgColor={GROUP_COLOR[id]} size="xs" />
                  <span
                    className="text-[1.5rem] font-semibold leading-tight"
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

      <div className="px-5 pt-3 pb-4 shrink-0">
        <div
          className="flex items-center gap-3 rounded-full px-4 py-3"
          style={{ background: 'hsl(var(--surface-bg))' }}
        >
          <Search className="w-5 h-5 shrink-0" style={{ color: 'hsl(var(--text-muted))' }} />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search"
            className="bg-transparent flex-1 outline-none text-[1.05rem] font-normal leading-tight min-w-0 placeholder:font-normal placeholder:text-[hsl(var(--text-muted))]"
            style={{ color: 'hsl(var(--text-primary))' }}
          />
          <button
            type="button"
            aria-label="Voice search"
            className="shrink-0 active:opacity-70 transition-opacity"
          >
            <Mic className="w-5 h-5" style={{ color: 'hsl(var(--text-muted))' }} />
          </button>
        </div>
      </div>
    </aside>
  );
}

export default SettingsSidebar;
