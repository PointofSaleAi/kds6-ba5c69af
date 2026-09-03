import React from 'react';
import { AbsoluteFill } from 'remotion';
import { C, CLIP } from '../theme';
import { ClipWindow } from '../components/ClipWindow';
import { Headline } from '../components/Headline';
import { Sparkles } from '../components/Sparkles';

/** Scene 3 — plain-language query, explained answer. */
export const S3Copilot: React.FC = () => (
  <AbsoluteFill>
    <ClipWindow src={CLIP.s3Dash} width={1300} scaleFrom={1} scaleTo={1.04} />
    <Sparkles
      sparks={[
        { x: 1400, y: 260, size: 56, at: 24 },
        { x: 400, y: 320, size: 40, at: 52, color: C.pink },
      ]}
    />
    <Headline
      eyebrow="Ask in plain language"
      line1="She knows your data —"
      line2="and explains what's happening."
      size={68}
      delay={18}
    />
  </AbsoluteFill>
);
