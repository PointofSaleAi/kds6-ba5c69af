import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Smartphone, Bug, LogOut, Hash, AlertCircle, Upload, MessageSquare, RotateCcw } from 'lucide-react';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { SectionHeaderCard } from '@/components/settings/SectionHeaderCard';
import { SettingsPill } from '@/components/settings/SettingsPill';
import { SwitchToggle, ValueText, useHashHighlight } from '@/components/settings/SettingsControls';
import { GROUP_COLOR } from '@/components/settings/SettingsSidebar';
import { ProfileSection } from '@/components/settings/ProfileSection';
import PinPadScreen from '@/pages/PinPadScreen';
import { toast } from '@/hooks/use-toast';

export default function AccountSettings() {
  const navigate = useNavigate();
  const [devMode, setDevMode] = useState(() => localStorage.getItem('posai-dev-mode') === 'true');
  const [bugReporting, setBugReporting] = useState(() => localStorage.getItem('posai-bug-reporting') === 'true');
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [staffSwitchOpen, setStaffSwitchOpen] = useState(false);
  const hash = useHashHighlight();

  const handleDevModeChange = (v: boolean) => {
    setDevMode(v);
    localStorage.setItem('posai-dev-mode', String(v));
  };

  const handleBugReportingChange = (v: boolean) => {
    setBugReporting(v);
    localStorage.setItem('posai-bug-reporting', String(v));
  };

  const handleUploadLogs = () => {
    toast({
      title: 'Logs uploaded',
      description: 'Diagnostic logs sent to support.',
    });
  };

  const handleFeedbackSubmit = () => {
    setFeedbackOpen(false);
    setFeedbackText('');
    toast({
      title: 'Feedback received',
      description: 'Thanks, your request was sent to the product team.',
    });
  };

  const handleLogOut = () => {
    setLogoutOpen(false);
    navigate('/kds/v1', { replace: true });
    setTimeout(() => window.location.reload(), 0);
  };

  const handleResetDefaults = () => {
    setResetOpen(false);
    try {
      // Device-specific keys are excluded from reset — they represent this
      // physical device's identity and paired hardware, not user preferences.
      const preserve = new Set([
        'posai-auth',
        'posai-session',
        'posai-device-name',
        'posai-station-id',
        'posai-printer-assignments',
        'posai-cloud-server',
      ]);
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (!k) continue;
        if (preserve.has(k)) continue;
        if (
          k.startsWith('posai-') ||
          k.startsWith('kds-') ||
          k.startsWith('kds.')
        ) {
          keysToRemove.push(k);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
    } catch {
      // ignore
    }
    toast({
      title: 'Settings reset',
      description: 'All system settings have been restored to defaults.',
    });
    setTimeout(() => window.location.reload(), 300);
  };

  return (
    <>
      <SectionHeaderCard
        icon={User}
        iconColor={GROUP_COLOR.account}
        title="Account"
        shortDescription="Manage this device's identity, developer tools, and session."
        longDescription="Manage this device's identity, developer tools, and session. Use Dev mode to surface the scenario selector during development. Logging out returns the device to the activation flow."
      />

      <ProfileSection
        onSwitchStaff={() => setStaffSwitchOpen(true)}
      />

      <div className="my-4 border-t" style={{ borderColor: 'hsl(var(--border))' }} />

      <SettingsPill
        icon={Smartphone}
        iconColor="#0A84FF"
        label="Device Name"
        helper="Identifier shown on receipts and in the admin console."
        right={<ValueText>Kitchen Display 1</ValueText>}
        highlighted={hash === 'device-name'}
      />

      <SettingsPill
        icon={Hash}
        iconColor="#525252"
        label="Station ID"
        helper="Unique station identifier assigned at activation."
        right={<ValueText>STN-001</ValueText>}
        highlighted={hash === 'station-id'}
      />

      <SettingsPill
        icon={AlertCircle}
        iconColor="#E84C3D"
        label="Bug Reporting"
        helper="Enable the in-app reporting tool for crash and issue capture."
        right={<SwitchToggle checked={bugReporting} onChange={handleBugReportingChange} />}
        highlighted={hash === 'bug-reporting'}
      />

      <SettingsPill
        icon={Bug}
        iconColor="#F9900E"
        label="Debug Mode"
        helper="Enable verbose logging and the developer scenario selector."
        right={<SwitchToggle checked={devMode} onChange={handleDevModeChange} />}
        highlighted={hash === 'debug-mode'}
      />

      <SettingsPill
        icon={Upload}
        iconColor="#16A085"
        label="Upload Logs"
        helper="Send recent diagnostic logs to eatOS support."
        onClick={handleUploadLogs}
        highlighted={hash === 'upload-logs'}
      />

      <SettingsPill
        icon={MessageSquare}
        iconColor="#7C3AED"
        label="Feedback & Support"
        helper="Request a feature or contact support."
        onClick={() => setFeedbackOpen(true)}
        highlighted={hash === 'feedback-support'}
      />

      <SettingsPill
        icon={RotateCcw}
        iconColor="#0A84FF"
        label="Reset to Default"
        helper="Restore all system settings to their original defaults on this device."
        onClick={() => setResetOpen(true)}
        highlighted={hash === 'reset-to-default'}
      />

      <SettingsPill
        icon={LogOut}
        iconColor="#C0392B"
        label="Log Out"
        helper="Sign out of this device and return to activation."
        onClick={() => setLogoutOpen(true)}
        highlighted={hash === 'log-out'}
      />

      {staffSwitchOpen && (
        <div className="fixed inset-0 z-[100]">
          <PinPadScreen
            context="staff-switch"
            onSuccess={() => setStaffSwitchOpen(false)}
            onCancel={() => setStaffSwitchOpen(false)}
          />
        </div>
      )}


      <AlertDialog open={resetOpen} onOpenChange={setResetOpen}>
        <AlertDialogContent className="bg-surface-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-text-primary">Reset all settings to default?</AlertDialogTitle>
            <AlertDialogDescription className="text-text-secondary">
              This will restore display, orders, hardware, AI, and account preferences to their system defaults on this device. Your session will not be signed out.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="min-h-[44px]">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleResetDefaults}
              className="bg-primary text-primary-foreground hover:bg-primary/90 min-h-[44px]"
            >
              Reset
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>


      <p className="text-center text-xs mt-4" style={{ color: 'hsl(var(--text-muted))' }}>
        Point of Sale Ai Kitchen Display System v2.4.1
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
              Log out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={feedbackOpen} onOpenChange={setFeedbackOpen}>
        <AlertDialogContent className="bg-surface-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-text-primary">Request a feature</AlertDialogTitle>
            <AlertDialogDescription className="text-text-secondary">
              Tell us what would make the KDS work better for your kitchen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <textarea
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            placeholder="Describe your request..."
            className="w-full min-h-[120px] rounded-lg border border-border bg-surface-bg p-3 text-sm text-text-primary outline-none focus:ring-2 focus:ring-primary"
          />
          <AlertDialogFooter>
            <AlertDialogCancel className="min-h-[44px]">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleFeedbackSubmit}
              disabled={feedbackText.trim().length === 0}
              className="bg-primary text-primary-foreground hover:bg-primary/90 min-h-[44px]"
            >
              Send
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
