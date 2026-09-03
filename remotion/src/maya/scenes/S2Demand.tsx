import React from 'react';
import { AbsoluteFill, Sequence } from 'remotion';
import { C, SHOT } from '../theme';
import { DeviceWindow } from '../components/DeviceWindow';
import { Headline } from '../components/Headline';
import { Sparkles } from '../components/Sparkles';
import { TouchTap } from '../components/TouchTap';

/** Scene 2 — demand forecast, then the roster auto-filling. */
export const S2Demand: React.FC = () => (
  <AbsoluteFill>
    <Sequence durationInFrames={148}>
      <DeviceWindow
        src={SHOT.allRecs}
        from={{ scale: 1.02, x: 0, y: 0 }}
        to={{ scale: 1.13, x: -110, y: 24 }}
        width={1560}
      />
      <Sparkles
        sparks={[
          { x: 1290, y: 250, size: 60, at: 26 },
          { x: 1240, y: 470, size: 42, at: 52, color: C.violet },
        ]}
      />
    </Sequence>

    <Sequence from={148}>
      <DeviceWindow
        src={SHOT.askMaya}
        from={{ scale: 1.06, x: 0, y: 0 }}
        to={{ scale: 1.14, x: -150, y: 0 }}
        width={1560}
      />
      <TouchTap taps={[{ x: 1300, y: 560, at: 34 }]} />
      <Sparkles sparks={[{ x: 1120, y: 400, size: 56, at: 22 }]} />
    </Sequence>

    <Headline
      eyebrow="Predict · Optimise · Personalise"
      line1="Demand forecast."
      line2="Labour, staffed automatically."
      accent={C.teal}
      size={78}
      delay={16}
    />
  </AbsoluteFill>
);
