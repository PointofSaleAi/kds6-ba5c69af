import React from 'react';
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from 'remotion';
import { C, LOGO_FRAMES } from '../theme';
import { Headline } from '../components/Headline';
import { Sparkles } from '../components/Sparkles';

const pad = (n: number) => String(n).padStart(3, '0');

/** Scene 1 — the supplied Maya logo animation, resolving into the bold title. */
export const S1Open: React.FC = () => {
  const frame = useCurrentFrame();

  const idx = Math.min(LOGO_FRAMES, Math.max(1, frame + 1));
  const logoFade = interpolate(frame, [0, 8, LOGO_FRAMES - 22, LOGO_FRAMES + 6], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const logoScale = interpolate(frame, [0, LOGO_FRAMES + 20], [1.02, 1.1], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill>
      {frame < LOGO_FRAMES + 8 ? (
        <AbsoluteFill style={{ opacity: logoFade, justifyContent: 'center', alignItems: 'center' }}>
          <Img
            src={staticFile(`logo/l${pad(idx)}.png`)}
            style={{ width: '100%', transform: `scale(${logoScale})` }}
          />
        </AbsoluteFill>
      ) : null}

      <Headline
        eyebrow="Maya AI Automation"
        line1="Meet Maya."
        line2="The first AI that runs your restaurant."
        size={104}
        delay={LOGO_FRAMES + 4}
        place="center"
      />
      <Sparkles
        sparks={[
          { x: 1420, y: 300, size: 74, at: LOGO_FRAMES + 16 },
          { x: 470, y: 760, size: 52, at: LOGO_FRAMES + 30, color: C.pink },
          { x: 1560, y: 800, size: 40, at: LOGO_FRAMES + 44 },
        ]}
      />
    </AbsoluteFill>
  );
};
