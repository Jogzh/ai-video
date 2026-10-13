import {Composition, Folder} from 'remotion';
import {EntropyFilm} from './Composition';
import {TimeScene} from './scenes/TimeScene';
import {GlassScene} from './scenes/GlassScene';
import {ProbabilityScene} from './scenes/ProbabilityScene';
import {MemoryScene} from './scenes/MemoryScene';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition id="Entropy" component={EntropyFilm} durationInFrames={864} fps={60} width={1080} height={1920} defaultProps={{voiceover: false}} />
      <Composition id="Entropy-Voice" component={EntropyFilm} durationInFrames={864} fps={60} width={1080} height={1920} defaultProps={{voiceover: true}} />
      <Folder name="Scenes">
        <Composition id="Time" component={TimeScene} durationInFrames={204} fps={60} width={1080} height={1920} />
        <Composition id="Glass" component={GlassScene} durationInFrames={216} fps={60} width={1080} height={1920} />
        <Composition id="Probability" component={ProbabilityScene} durationInFrames={222} fps={60} width={1080} height={1920} />
        <Composition id="Memory" component={MemoryScene} durationInFrames={258} fps={60} width={1080} height={1920} />
      </Folder>
    </>
  );
};
