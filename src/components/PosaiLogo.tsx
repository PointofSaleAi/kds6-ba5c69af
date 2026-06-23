import posaiLogoWhite from '@/assets/posai-logo-white.png';
import posaiLogoBlack from '@/assets/posai-logo.png';

interface PosaiLogoProps {
  variant?: 'light' | 'dark' | 'auto';
  className?: string;
}

/**
 * Displays the Point of Sale Ai logo with the correct color variant.
 * - variant="light" → white logo (for dark backgrounds)
 * - variant="dark"  → black logo (for light backgrounds)
 * - variant="auto"  → picks based on the current theme class on <html>
 */
export default function PosaiLogo({ variant = 'auto', className = 'h-14 object-contain' }: PosaiLogoProps) {
  const isDark =
    variant === 'light'
      ? true
      : variant === 'dark'
        ? false
        : typeof window !== 'undefined' && document.documentElement.classList.contains('dark');

  const src = isDark ? posaiLogoWhite : posaiLogoBlack;

  return <img src={src} alt="Point of Sale Ai" className={className} />;
}
