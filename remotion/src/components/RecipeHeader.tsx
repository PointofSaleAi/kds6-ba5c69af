import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

export const RecipeHeader: React.FC<{ productName: string; progress: number }> = ({
  productName,
  progress,
}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        padding: '40px 48px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        opacity,
      }}
    >
      <div>
        <div
          style={{
            fontFamily: 'Montserrat, Arial, sans-serif',
            fontSize: 18,
            fontWeight: 600,
            color: '#9CA3AF',
            textTransform: 'uppercase',
            letterSpacing: 1,
            marginBottom: 8,
          }}
        >
          Recipe Reference
        </div>
        <div
          style={{
            fontFamily: 'Montserrat, Arial, sans-serif',
            fontSize: 48,
            fontWeight: 900,
            color: '#FFFFFF',
            lineHeight: 1.1,
            textTransform: 'uppercase',
          }}
        >
          {productName}
        </div>
      </div>
      <div
        style={{
          fontFamily: 'Montserrat, Arial, sans-serif',
          fontSize: 18,
          fontWeight: 700,
          color: '#FFFFFF',
          background: 'rgba(232, 76, 61, 0.9)',
          padding: '8px 16px',
          borderRadius: 8,
        }}
      >
        {Math.round(progress * 100)}%
      </div>
    </div>
  );
};
