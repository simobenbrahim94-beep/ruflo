import { Composition } from 'remotion';
import { RoutinesCinematic, VIDEO_CONFIG } from './RoutinesCinematic.jsx';

export const RemotionRoot = () => (
  <Composition
    id="RoutinesCinematic"
    component={RoutinesCinematic}
    durationInFrames={VIDEO_CONFIG.durationInFrames}
    fps={VIDEO_CONFIG.fps}
    width={VIDEO_CONFIG.width}
    height={VIDEO_CONFIG.height}
  />
);
