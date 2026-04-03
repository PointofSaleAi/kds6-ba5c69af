interface FireButtonProps {
  label: string;
  disabled: boolean;
  onClick?: () => void;
}

export function FireButton({ label, disabled, onClick }: FireButtonProps) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`px-4 py-2 rounded text-cta uppercase min-h-[44px] transition-colors ${
        disabled
          ? 'bg-muted text-muted-foreground pointer-events-none'
          : 'bg-primary text-primary-foreground hover:opacity-90'
      }`}
    >
      {label}
    </button>
  );
}
