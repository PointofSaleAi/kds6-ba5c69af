import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, Img, staticFile } from 'remotion';
import type { VideoStep } from '../types';

function renderBold(s: string) {
  return s.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith('**') && part.endsWith('**') ? (
      <span key={i} style={{ fontWeight: 700, color: '#FFFFFF' }}>
        {part.slice(2, -2)}
      </span>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

export const RecipeStepScene: React.FC<{ step: VideoStep; index: number; total: number }> = ({
  step,
  index,
  total,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: 'clamp' });
  const slideIn = interpolate(frame, [0, 12], [60, 0], { extrapolateRight: 'clamp' });
  const imageScale = interpolate(frame, [0, durationInFrames], [1, 1.08], { extrapolateRight: 'clamp' });

  const src = step.image || staticFile('placeholder.jpg');

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: fadeIn,
        transform: `translateY(${slideIn}px)`,
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          overflow: 'hidden',
          borderRadius: 0,
        }}
      >
        <Img
          src={src}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: `scale(${imageScale})`,
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(26,26,46,0.95) 0%, rgba(26,26,46,0.4) 50%, rgba(26,26,46,0.2) 100%)',
          }}
        />
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: 120,
          left: 48,
          right: 48,
          display: 'flex',
          gap: 24,
          alignItems: 'flex-start',
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: '#E84C3D',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            fontFamily: 'Montserrat, Arial, sans-serif',
            fontSize: 24,
            fontWeight: 900,
            color: '#FFFFFF',
          }}
        >
          {index + 1}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontFamily: 'Montserrat, Arial, sans-serif',
              fontSize: 36,
              fontWeight: 800,
              color: '#FFFFFF',
              marginBottom: 12,
              textTransform: 'uppercase',
              lineHeight: 1.15,
            }}
          >
            {step.title}
          </div>
          <div
            style={{
              fontFamily: 'Inter, Arial, sans-serif',
              fontSize: 24,
              color: '#D1D5DB',
              lineHeight: 1.4,
            }}
          >
            {renderBold(step.instruction)}
          </div>
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: 48,
          left: 48,
          right: 48,
          height: 6,
          background: 'rgba(255,255,255,0.12)',
          borderRadius: 3,
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${((index + 1) / total) * 100}%`,
            background: '#E84C3D',
            borderRadius: 3,
            transition: 'none',
          }}
        />
      </div>
    </div>
  );
};
