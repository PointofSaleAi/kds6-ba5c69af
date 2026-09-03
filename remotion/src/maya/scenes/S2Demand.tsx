import React from 'react';
import { AbsoluteFill } from 'remotion';
import { C, CLIP } from '../theme';
import { ClipWindow } from '../components/ClipWindow';
import { Headline } from '../components/Headline';
import { Sparkles } from '../components/Sparkles';

/** Scene 2 — demand forecast and labour, from the dashboard recording. */
export const S2Demand: React.FC = () => (
  <AbsoluteFill>
    <ClipWindow src={CLIP.s2Dash} width={1600} scaleFrom={1} scaleTo={1.05} />
    <Sparkles
      sparks={[
        { x: 1420, y: 250, size: 60, at: 26 },
        { x: 380, y: 300, size: 42, at: 58, color: C.pink },
      ]}
    />
    <Headline
      eyebrow="Predict / Optimise / Personalise"
      line1="Demand forecast."
      line2="Labour, staffed automatically."
      size={72}
      delay={16}
    />
  </AbsoluteFill>
);
