import React from 'react';
import { AbsoluteFill } from 'remotion';
import { C, CLIP } from '../theme';
import { ClipWindow } from '../components/ClipWindow';
import { Headline } from '../components/Headline';
import { Sparkles } from '../components/Sparkles';

/** Scene 5 — saved AI reports opening up. */
export const S5Reports: React.FC = () => (
  <AbsoluteFill>
    <ClipWindow src={CLIP.s5Dash} width={1600} scaleFrom={1} scaleTo={1.05} />
    <Sparkles
      sparks={[
        { x: 1450, y: 250, size: 58, at: 34 },
        { x: 360, y: 300, size: 40, at: 62, color: C.pink },
      ]}
    />
    <Headline
      eyebrow="Built for you, every day"
      line1="Reports ready before"
      line2="you think to ask."
      size={70}
      delay={22}
    />
  </AbsoluteFill>
);
