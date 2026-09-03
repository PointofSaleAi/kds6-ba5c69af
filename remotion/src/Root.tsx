import React from 'react';
import { Composition } from 'remotion';
import { loadFont } from '@remotion/google-fonts/Montserrat';
import { MainVideo } from './MainVideo';
import { TourVideo, tourDurationInFrames } from './tour/TourVideo';
import { MayaVideo } from './maya/MayaVideo';
import { TOTAL as MAYA_TOTAL } from './maya/theme';
import type { RecipeVideoProps } from './types';

loadFont('normal', { weights: ['400', '600', '700', '800', '900'], subsets: ['latin'] });

export const RemotionRoot: React.FC = () => {
  return (
    <>
    <Composition
      id="maya-ai"
      component={MayaVideo}
      durationInFrames={MAYA_TOTAL}
      fps={30}
      width={1920}
      height={1080}
    />
    <Composition
      id="kds-tour"
      component={TourVideo}
      durationInFrames={tourDurationInFrames()}
      fps={30}
      width={1920}
      height={1080}
    />
    <Composition
      id="recipe"
      component={MainVideo}
      durationInFrames={450}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={{
        productName: 'Grilled Salmon',
        steps: [
          { title: 'Mise en place', instruction: 'Gather **all ingredients** at the station before firing.', image: 'https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=400&h=260&fit=crop' },
          { title: 'Preheat station', instruction: 'Bring **grill or pan** to service temperature.', image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=260&fit=crop' },
          { title: 'Season protein', instruction: 'Season generously with **salt and pepper** just before cooking.', image: 'https://images.unsplash.com/photo-1558030006-450675393462?w=400&h=260&fit=crop' },
        ],
        durationSeconds: 15,
      }}
      schema={undefined}
    />
    </>
  );
};
