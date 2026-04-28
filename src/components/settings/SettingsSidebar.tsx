import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, Monitor, ShoppingBag, Send, Cpu, User } from 'lucide-react';
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
      <div className="px-4 pt-4 pb-3 shrink-0">
        <h2 className="text-xl font-bold" style={{ color: 'hsl(var(--text-primary))' }}>
          Settings
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide px-2 pb-2">
        {showResults ? (
          <div className="px-2">
            <div
              className="text-xs font-medium uppercase tracking-wider px-2 py-2"
              style={{ color: 'hsl(var(--text-muted))' }}
            >
              {results.length} result{results.length === 1 ? '' : 's'}
            </div>
            {results.length === 0 && (
              <p className="text-sm px-2 py-3" style={{ color: 'hsl(var(--text-muted))' }}>
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
                  className="w-full flex items-center gap-3 px-2 py-2.5 rounded-xl active:opacity-70 transition-opacity"
                >
                  <SettingsIconTile icon={Icon} bgColor={GROUP_COLOR[r.group]} />
                  <div className="flex-1 min-w-0 text-left">
                    <div
                      className="text-sm font-medium truncate"
                      style={{ color: 'hsl(var(--text-primary))' }}
                    >
                      {r.label}
                    </div>
                    <div
                      className="text-xs truncate"
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
          <nav className="flex flex-col gap-1 px-2 pt-1">
            {groupIds.map((id) => {
              const group = SETTINGS_GROUPS[id];
              const Icon = GROUP_ICON[id];
              const isActive = location.pathname.startsWith(group.path);
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => navigate(group.path)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl active:opacity-70 transition-all"
                  style={{
                    background: isActive ? 'hsl(var(--surface-bg))' : 'transparent',
                  }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <SettingsIconTile icon={Icon} bgColor={GROUP_COLOR[id]} />
                    <span
                      className="text-[15px] font-medium"
                      style={{ color: 'hsl(var(--text-primary))' }}
                    >
                      {group.label}
                    </span>
                  </div>
                </button>
              );
            })}
          </nav>
        )}
      </div>

      <div className="px-4 pt-3 pb-3 shrink-0">
        <div
          className="flex items-center gap-2 rounded-full px-3.5 py-2.5"
          style={{ background: 'hsl(var(--surface-bg))' }}
        >
          <Search size={16} style={{ color: 'hsl(var(--text-muted))' }} />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search settings"
            className="bg-transparent flex-1 outline-none text-sm"
            style={{ color: 'hsl(var(--text-primary))' }}
          />
        </div>
      </div>
    </aside>
  );
}

export default SettingsSidebar;
