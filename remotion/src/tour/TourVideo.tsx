import React from 'react';
import {
  AbsoluteFill,
  Img,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { TransitionSeries, springTiming } from '@remotion/transitions';
import { fade } from '@remotion/transitions/fade';
import trackData from './track-data.json';
import { TouchLayer } from './TouchLayer';
import { TourCaption } from './TourCaption';

const SRC_W = 1920;
const SRC_H = 1080;

// Brand palette (Point of Sale Ai)
export const INK = '#0D0D1A';
export const ACCENT = '#1DA94A';
export const CREAM = '#F0F2F5';

type Beat = {
  from: number;
  to: number;
  title: string;
  sub: string;
  /** Normalised focus point the camera drifts toward. */
  focus: [number, number];
  zoom: [number, number];
};

const BEATS: Beat[] = [
  {
    from: 240,
    to: 402,
    title: 'One board, every ticket',
    sub: 'Dine in, drive thru, pickup — all live, all sorted by urgency',
    focus: [0.42, 0.34],
    zoom: [1.0, 1.09],
  },
  {
    from: 471,
    to: 712,
    title: 'Seen → Preparing → Served',
    sub: 'Tap an item to move it forward, or serve the whole ticket at once',
    focus: [0.38, 0.5],
    zoom: [1.12, 1.0],
  },
  {
    from: 996,
    to: 1148,
    title: 'Everything the line needs to know',
    sub: 'Order moves, low stock and 86 calls land in one feed',
    focus: [0.78, 0.42],
    zoom: [1.0, 1.14],
  },
  {
    from: 1160,
    to: 1342,
    title: 'Ask AI what to do next',
    sub: 'The kitchen assistant reads the queue and prompts the next step',
    focus: [0.8, 0.36],
    zoom: [1.14, 1.02],
  },
];

const TRACK = trackData.track as (number[] | null)[];
const TAPS = trackData.taps as number[];

const SourceFrame: React.FC<{ frame: number }> = ({ frame }) => (
  <Img
    src={staticFile(`frames/f${String(frame).padStart(5, '0')}.jpg`)}
    style={{ width: SRC_W, height: SRC_H, objectFit: 'cover' }}
  />
);

const Grain: React.FC = () => (
  <AbsoluteFill
    style={{
      pointerEvents: 'none',
      opacity: 0.16,
      backgroundImage:
        'radial-gradient(circle at 20% 15%, rgba(255,255,255,0.10), transparent 55%), radial-gradient(circle at 85% 90%, rgba(29,169,74,0.14), transparent 60%)',
    }}
  />
);

const Vignette: React.FC = () => (
  <AbsoluteFill
    style={{
      pointerEvents: 'none',
      boxShadow: 'inset 0 0 220px 70px rgba(3,4,10,0.55)',
    }}
  />
);

const BeatScene: React.FC<{ beat: Beat; index: number }> = ({ beat, index }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const len = beat.to - beat.from;
  const t = interpolate(frame, [0, len], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const scale = interpolate(t, [0, 1], beat.zoom);
  // Drift the framing gently toward the focus point.
  const fx = interpolate(t, [0, 1], [0.5, beat.focus[0]]);
  const fy = interpolate(t, [0, 1], [0.5, beat.focus[1]]);
  const tx = (0.5 - fx) * SRC_W * (scale - 1);
  const ty = (0.5 - fy) * SRC_H * (scale - 1);

  const settle = spring({ frame, fps, config: { damping: 200 }, durationInFrames: 26 });
  const lift = interpolate(settle, [0, 1], [26, 0]);

  return (
    <AbsoluteFill style={{ backgroundColor: '#05060C' }}>
      <AbsoluteFill
        style={{
          transform: `translate(${tx}px, ${ty + lift}px) scale(${scale})`,
          transformOrigin: 'center center',
        }}
      >
        <SourceFrame frame={beat.from + Math.min(frame, len)} />
        <TouchLayer
          startFrom={beat.from}
          track={TRACK}
          taps={TAPS}
          screenScale={1}
        />
      </AbsoluteFill>
      <Vignette />
      <Grain />
      <TourCaption
        title={beat.title}
        sub={beat.sub}
        step={index + 1}
        total={BEATS.length}
      />
    </AbsoluteFill>
  );
};

const Card: React.FC<{ kicker: string; title: string; sub: string; outro?: boolean }> = ({
  kicker,
  title,
  sub,
  outro,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 200 }, durationInFrames: 30 });
  const y = interpolate(s, [0, 1], [40, 0]);
  const lineW = interpolate(spring({ frame: frame - 6, fps, config: { damping: 200 } }), [0, 1], [0, 220]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: INK,
        backgroundImage:
          'radial-gradient(ellipse at 25% 20%, rgba(29,169,74,0.22), transparent 55%), radial-gradient(ellipse at 80% 85%, rgba(41,128,185,0.20), transparent 60%)',
        justifyContent: 'center',
        paddingLeft: 168,
      }}
    >
      <div style={{ transform: `translateY(${y}px)`, opacity: s }}>
        <div
          style={{
            fontFamily: 'Montserrat',
            fontWeight: 700,
            letterSpacing: 6,
            fontSize: 22,
            color: ACCENT,
            textTransform: 'uppercase',
          }}
        >
          {kicker}
        </div>
        <div
          style={{
            width: lineW,
            height: 4,
            background: ACCENT,
            borderRadius: 2,
            margin: '26px 0 34px',
          }}
        />
        <div
          style={{
            fontFamily: 'Montserrat',
            fontWeight: 900,
            fontSize: outro ? 104 : 118,
            lineHeight: 1.02,
            color: CREAM,
            maxWidth: 1250,
            whiteSpace: 'pre-line',
          }}
        >
          {title}
        </div>
        <div
          style={{
            marginTop: 30,
            fontFamily: 'Montserrat',
            fontWeight: 500,
            fontSize: 34,
            color: 'rgba(240,242,245,0.72)',
            maxWidth: 1050,
          }}
        >
          {sub}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const TOUR_TRANSITION = 16;

export const tourDurationInFrames = () => {
  const intro = 78;
  const outro = 84;
  const beats = BEATS.reduce((a, b) => a + (b.to - b.from), 0);
  const transitions = (BEATS.length + 1) * TOUR_TRANSITION;
  return intro + beats + outro - transitions;
};

export const TourVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: '#05060C' }}>
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={78}>
          <Card
            kicker="Point of Sale Ai"
            title={'Kitchen Display\nSystem'}
            sub="A guided tour of the line — tickets, stations and the AI assistant"
          />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={springTiming({ config: { damping: 200 }, durationInFrames: TOUR_TRANSITION })}
        />
        {BEATS.map((beat, i) => (
          <React.Fragment key={beat.from}>
            <TransitionSeries.Sequence durationInFrames={beat.to - beat.from}>
              <BeatScene beat={beat} index={i} />
            </TransitionSeries.Sequence>
            <TransitionSeries.Transition
              presentation={fade()}
              timing={springTiming({ config: { damping: 200 }, durationInFrames: TOUR_TRANSITION })}
            />
          </React.Fragment>
        ))}
        <TransitionSeries.Sequence durationInFrames={84}>
          <Card
            kicker="Built for the line"
            title={'Faster tickets.\nCalmer kitchen.'}
            sub="Point of Sale Ai — Kitchen Display System"
            outro
          />
        </TransitionSeries.Sequence>
      </TransitionSeries>
      <Sequence>
        <AbsoluteFill />
      </Sequence>
    </AbsoluteFill>
  );
};
