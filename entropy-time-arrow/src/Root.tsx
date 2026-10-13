import {Composition,Folder} from 'remotion';
import {Cinema} from './landscape/Cinema';
import {CinemaOpening} from './landscape/scenes/Opening';
import {CinemaCup} from './landscape/scenes/Cup';
import {CinemaSmoke} from './landscape/scenes/Smoke';
import {CinemaLight} from './landscape/scenes/Light';
import {CinemaProbability} from './landscape/scenes/Probability';
import {CinemaSun} from './landscape/scenes/Sun';
import {CinemaRings} from './landscape/scenes/Rings';
import {CinemaHuman} from './landscape/scenes/Human';
import {CinemaCost} from './landscape/scenes/Cost';
import {CinemaArrow} from './landscape/scenes/Arrow';
import {CinemaRemember} from './landscape/scenes/Remember';
export const Root=()=> <>
 <Composition id="TimeArrow" component={Cinema} durationInFrames={2220} fps={30} width={1920} height={1080}/>
 <Folder name="Cinema-Scenes">
  <Composition id="Cinema-Opening" component={CinemaOpening} durationInFrames={198} fps={30} width={1920} height={1080}/>
  <Composition id="Cinema-Cup" component={CinemaCup} durationInFrames={228} fps={30} width={1920} height={1080}/>
  <Composition id="Cinema-Smoke" component={CinemaSmoke} durationInFrames={198} fps={30} width={1920} height={1080}/>
  <Composition id="Cinema-Light" component={CinemaLight} durationInFrames={198} fps={30} width={1920} height={1080}/>
  <Composition id="Cinema-Probability" component={CinemaProbability} durationInFrames={288} fps={30} width={1920} height={1080}/>
  <Composition id="Cinema-Sun" component={CinemaSun} durationInFrames={228} fps={30} width={1920} height={1080}/>
  <Composition id="Cinema-Rings" component={CinemaRings} durationInFrames={198} fps={30} width={1920} height={1080}/>
  <Composition id="Cinema-Human" component={CinemaHuman} durationInFrames={228} fps={30} width={1920} height={1080}/>
  <Composition id="Cinema-Cost" component={CinemaCost} durationInFrames={228} fps={30} width={1920} height={1080}/>
  <Composition id="Cinema-Arrow" component={CinemaArrow} durationInFrames={198} fps={30} width={1920} height={1080}/>
  <Composition id="Cinema-Remember" component={CinemaRemember} durationInFrames={210} fps={30} width={1920} height={1080}/>
 </Folder>
</>;
