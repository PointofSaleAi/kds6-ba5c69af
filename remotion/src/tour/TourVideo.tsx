import React from 'react';
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from 'remotion';
import { TransitionSeries, springTiming } from '@remotion/transitions';
import { fade } from '@remotion/transitions/fade';
import trackData from './track-data.json';
import { TouchLayer } from './TouchLayer';

const SRC_W = 1920;
const SRC_H = 1080;

type Beat = { from: number; to: number };

// Straight cuts through the recording — sign-in first, then the board flow.
const BEATS: Beat[] = [
  { from: 42, to: 232 },
  { from: 240, to: 402 },
  { from: 471, to: 712 },
  { from: 996, to: 1148 },
  { from: 1160, to: 1342 },
];

const TRACK = trackData.track as (number[] | null)[];
const TAPS = trackData.taps as number[];

const SourceFrame: React.FC<{ frame: number }> = ({ frame }) => (
  <Img
    src={staticFile(`frames/f${String(frame).padStart(5, '0')}.jpg`)}
    style={{ width: SRC_W, height: SRC_H, objectFit: 'cover' }}
  />
);

const BeatScene: React.FC<{ beat: Beat }> = ({ beat }) => {
  const frame = Math.min(
    // eslint-disable-next-line react-hooks/rules-of-hooks
    require('remotion').useCurrentFrame() as number,
    beat.to - beat.from,
  );

  return (
    <AbsoluteFill style={{ backgroundColor: '#05060C' }}>
      <SourceFrame frame={beat.from + frame} />
      <TouchLayer startFrom={beat.from} track={TRACK} taps={TAPS} screenScale={1} />
    </AbsoluteFill>
  );
};

export const TOUR_TRANSITION = 14;

export const tourDurationInFrames = () => {
  const beats = BEATS.reduce((a, b) => a + (b.to - b.from), 0);
  const transitions = (BEATS.length - 1) * TOUR_TRANSITION;
  return beats - transitions;
};

export const TourVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: '#05060C' }}>
      <TransitionSeries>
        {BEATS.map((beat, i) => (
          <React.Fragment key={beat.from}>
            <TransitionSeries.Sequence durationInFrames={beat.to - beat.from}>
              <BeatScene beat={beat} />
            </TransitionSeries.Sequence>
            {i < BEATS.length - 1 && (
              <TransitionSeries.Transition
                presentation={fade()}
                timing={springTiming({ config: { damping: 200 }, durationInFrames: TOUR_TRANSITION })}
              />
            )}
          </React.Fragment>
        ))}
      </TransitionSeries>
    </AbsoluteFill>
  );
};
