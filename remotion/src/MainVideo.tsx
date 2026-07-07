import React from 'react';
import { AbsoluteFill, useVideoConfig } from 'remotion';
import { TransitionSeries, linearTiming } from '@remotion/transitions';
import { fade } from '@remotion/transitions/fade';
import { RecipeHeader } from './components/RecipeHeader';
import { RecipeStepScene } from './scenes/RecipeStepScene';
import type { RecipeVideoProps } from './types';

export const MainVideo: React.FC<RecipeVideoProps> = ({
  productName,
  steps,
  durationSeconds,
}) => {
  const { fps, durationInFrames } = useVideoConfig();
  const total = Math.max(1, steps.length);
  const stepFrames = Math.floor(durationInFrames / total);
  const transitionFrames = Math.min(12, Math.floor(stepFrames * 0.15));
  const sceneFrames = Math.max(24, stepFrames - transitionFrames);

  return (
    <AbsoluteFill
      style={{
        background: '#1A1A2E',
        fontFamily: 'Montserrat, Arial, sans-serif',
      }}
    >
      <TransitionSeries
        style={{
          width: '100%',
          height: '100%',
        }}
      >
        {steps.map((step, i) => (
          <React.Fragment key={i}>
            <TransitionSeries.Sequence durationInFrames={sceneFrames}>
              <RecipeStepScene step={step} index={i} total={total} />
            </TransitionSeries.Sequence>
            {i < steps.length - 1 && (
              <TransitionSeries.Transition
                presentation={fade()}
                timing={linearTiming({ durationInFrames: transitionFrames })}
              />
            )}
          </React.Fragment>
        ))}
      </TransitionSeries>

      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <RecipeHeader productName={productName} />
      </div>
    </AbsoluteFill>
  );
};
