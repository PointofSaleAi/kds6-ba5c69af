import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Smartphone, Bug, LogOut } from 'lucide-react';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { SectionHeaderCard } from '@/components/settings/SectionHeaderCard';
import { SettingsPill } from '@/components/settings/SettingsPill';
import { SwitchToggle, ValueText, useHashHighlight } from '@/components/settings/SettingsControls';
import { GROUP_COLOR } from '@/components/settings/SettingsSidebar';

export default function AccountSettings() {
  const navigate = useNavigate();
  const [devMode, setDevMode] = useState(() => localStorage.getItem('posai-dev-mode') === 'true');
  const [logoutOpen, setLogoutOpen] = useState(false);
  const hash = useHashHighlight();

  const handleDevModeChange = (v: boolean) => {
    setDevMode(v);
    localStorage.setItem('posai-dev-mode', String(v));
  };

  const handleLogOut = () => {
    setLogoutOpen(false);
    // Reset session and return to entry route. The Index page handles dev/splash.
    navigate('/kds/full', { replace: true });
    setTimeout(() => window.location.reload(), 0);
  };

  return (
    <>
      <SectionHeaderCard
        icon={User}
        iconColor={GROUP_COLOR.account}
        title="Account"
        shortDescription="Manage this device's identity, developer tools, and session."
        longDescription="Manage this device's identity, developer tools, and session. Use Dev Mode to surface the scenario selector during development. Logging out returns the device to the activation flow."
      />

      <SettingsPill
        icon={Smartphone}
        iconColor="#0A84FF"
        label="Device name"
        helper="Identifier shown on receipts and in the admin console."
        right={<ValueText>Kitchen Display 1</ValueText>}
        highlighted={hash === 'device-name'}
      />

      <SettingsPill
        icon={Bug}
        iconColor="#F9900E"
        label="Dev mode"
        helper="Show the developer scenario selector on next launch."
        right={<SwitchToggle checked={devMode} onChange={handleDevModeChange} />}
        highlighted={hash === 'dev-mode'}
      />

      <SettingsPill
        icon={LogOut}
        iconColor="#C0392B"
        label="Log out"
        helper="Sign out of this device and return to activation."
        onClick={() => setLogoutOpen(true)}
        highlighted={hash === 'log-out'}
      />

      <p className="text-center text-xs mt-4" style={{ color: 'hsl(var(--text-muted))' }}>
        POSAI Kitchen Display System v2.4.1
      </p>

      <AlertDialog open={logoutOpen} onOpenChange={setLogoutOpen}>
        <AlertDialogContent className="bg-surface-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-text-primary">Log out of this device?</AlertDialogTitle>
            <AlertDialogDescription className="text-text-secondary">
              You will need to re-enter your PIN or activation code to sign back in.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="min-h-[44px]">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLogOut}
              className="bg-primary text-primary-foreground hover:bg-primary/90 min-h-[44px]"
            >
              Log Out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
