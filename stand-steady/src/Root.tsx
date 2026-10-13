import React from 'react';
import {Composition} from 'remotion';
import {StandSteady} from './StandSteady';

export const Root: React.FC = () => (
  <Composition
    id="StandSteady"
    component={StandSteady}
    durationInFrames={840}
    fps={30}
    width={1920}
    height={1080}
  />
);
