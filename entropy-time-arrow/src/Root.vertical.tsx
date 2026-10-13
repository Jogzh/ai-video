import {Composition,Folder} from 'remotion';
import {TimeArrow} from './TimeArrow';
import {Opening} from './scenes/Opening';
import {Cup} from './scenes/Cup';
import {Smoke} from './scenes/Smoke';
import {Photons} from './scenes/Photons';
import {Probability} from './scenes/Probability';
import {Sun} from './scenes/Sun';
import {Rings} from './scenes/Rings';
import {Human} from './scenes/Human';
import {Cost} from './scenes/Cost';
import {Arrow} from './scenes/Arrow';
import {Remember} from './scenes/Remember';
export const Root=()=> <>
 <Composition id="TimeArrow" component={TimeArrow} durationInFrames={2040} fps={30} width={1080} height={1920}/>
 <Folder name="Scenes">
  <Composition id="Opening" component={Opening} durationInFrames={195} fps={30} width={1080} height={1920}/>
  <Composition id="Cup" component={Cup} durationInFrames={195} fps={30} width={1080} height={1920}/>
  <Composition id="Smoke" component={Smoke} durationInFrames={180} fps={30} width={1080} height={1920}/>
  <Composition id="Photons" component={Photons} durationInFrames={180} fps={30} width={1080} height={1920}/>
  <Composition id="Probability" component={Probability} durationInFrames={255} fps={30} width={1080} height={1920}/>
  <Composition id="Sun" component={Sun} durationInFrames={195} fps={30} width={1080} height={1920}/>
  <Composition id="Rings" component={Rings} durationInFrames={180} fps={30} width={1080} height={1920}/>
  <Composition id="Human" component={Human} durationInFrames={210} fps={30} width={1080} height={1920}/>
  <Composition id="Cost" component={Cost} durationInFrames={210} fps={30} width={1080} height={1920}/>
  <Composition id="Arrow" component={Arrow} durationInFrames={180} fps={30} width={1080} height={1920}/>
  <Composition id="Remember" component={Remember} durationInFrames={210} fps={30} width={1080} height={1920}/>
 </Folder>
</>;
