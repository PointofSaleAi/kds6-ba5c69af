import React from 'react';
import { AbsoluteFill, Sequence } from 'remotion';
import { SCENES, SCENE_STARTS } from './theme';
import { Stage } from './components/Stage';
import { S1Open } from './scenes/S1Open';
import { S2Demand } from './scenes/S2Demand';
import { S3Copilot } from './scenes/S3Copilot';
import { S4Ordering } from './scenes/S4Ordering';
import { S5Reports } from './scenes/S5Reports';
import { S6Upsell } from './scenes/S6Upsell';
import { S7Menu } from './scenes/S7Menu';
import { S8Settings } from './scenes/S8Settings';
import { S9Close } from './scenes/S9Close';

const COMPONENTS = [S1Open, S2Demand, S3Copilot, S4Ordering, S5Reports, S6Upsell, S7Menu, S8Settings, S9Close];

export const MayaVideo: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: '#02030A' }}>
    {SCENES.map((scene, i) => {
      const Scene = COMPONENTS[i];
      return (
        <Sequence key={scene.id} from={SCENE_STARTS[i]} durationInFrames={scene.dur}>
          <Stage bloom={i === 0 ? 0.7 : 1}>
            <Scene />
          </Stage>
        </Sequence>
      );
    })}
  </AbsoluteFill>
);
