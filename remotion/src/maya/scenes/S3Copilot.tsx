import React from 'react';
import { AbsoluteFill } from 'remotion';
import { C, SHOT } from '../theme';
import { DeviceWindow } from '../components/DeviceWindow';
import { Headline } from '../components/Headline';
import { Sparkles } from '../components/Sparkles';
import { TypedQuery } from '../components/TypedQuery';

/** Scene 3 — plain-language query, explained answer. */
export const S3Copilot: React.FC = () => (
  <AbsoluteFill>
    <DeviceWindow
      src={SHOT.askMaya2}
      from={{ scale: 1.04, x: 0, y: -10 }}
      to={{ scale: 1.12, x: -130, y: -20 }}
      width={1560}
    />
    <TypedQuery text="Why did I sell more this July?" at={10} width={980} />
    <Sparkles
      sparks={[
        { x: 1140, y: 340, size: 58, at: 66 },
        { x: 1520, y: 520, size: 40, at: 84, color: C.violet },
      ]}
    />
    <Headline
      eyebrow="Ask in plain language"
      line1="She knows your data —"
      line2="and explains what's happening."
      accent={C.blueBright}
      size={74}
      delay={70}
      place="top-left"
    />
  </AbsoluteFill>
);
