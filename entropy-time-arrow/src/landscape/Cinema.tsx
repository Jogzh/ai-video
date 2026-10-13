import {useVideoConfig} from 'remotion';
import {TransitionSeries,linearTiming} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';
import {CinemaOpening} from './scenes/Opening';
import {CinemaCup} from './scenes/Cup';
import {CinemaSmoke} from './scenes/Smoke';
import {CinemaLight} from './scenes/Light';
import {CinemaProbability} from './scenes/Probability';
import {CinemaSun} from './scenes/Sun';
import {CinemaRings} from './scenes/Rings';
import {CinemaHuman} from './scenes/Human';
import {CinemaCost} from './scenes/Cost';
import {CinemaArrow} from './scenes/Arrow';
import {CinemaRemember} from './scenes/Remember';
export const Cinema=()=>{const{fps}=useVideoConfig();return <TransitionSeries>
 <TransitionSeries.Sequence name="01 · 时间" durationInFrames={6.6*fps} premountFor={fps}><CinemaOpening/></TransitionSeries.Sequence>
 <TransitionSeries.Transition presentation={fade()} timing={linearTiming({durationInFrames:.6*fps})}/>
 <TransitionSeries.Sequence name="02 · 破碎" durationInFrames={7.6*fps} premountFor={fps}><CinemaCup/></TransitionSeries.Sequence>
 <TransitionSeries.Transition presentation={fade()} timing={linearTiming({durationInFrames:.6*fps})}/>
 <TransitionSeries.Sequence name="03 · 扩散" durationInFrames={6.6*fps} premountFor={fps}><CinemaSmoke/></TransitionSeries.Sequence>
 <TransitionSeries.Transition presentation={fade()} timing={linearTiming({durationInFrames:.6*fps})}/>
 <TransitionSeries.Sequence name="04 · 远去" durationInFrames={6.6*fps} premountFor={fps}><CinemaLight/></TransitionSeries.Sequence>
 <TransitionSeries.Transition presentation={fade()} timing={linearTiming({durationInFrames:.6*fps})}/>
 <TransitionSeries.Sequence name="05 · 概率" durationInFrames={9.6*fps} premountFor={fps}><CinemaProbability/></TransitionSeries.Sequence>
 <TransitionSeries.Transition presentation={fade()} timing={linearTiming({durationInFrames:.6*fps})}/>
 <TransitionSeries.Sequence name="06 · 太阳" durationInFrames={7.6*fps} premountFor={fps}><CinemaSun/></TransitionSeries.Sequence>
 <TransitionSeries.Transition presentation={fade()} timing={linearTiming({durationInFrames:.6*fps})}/>
 <TransitionSeries.Sequence name="07 · 年轮" durationInFrames={6.6*fps} premountFor={fps}><CinemaRings/></TransitionSeries.Sequence>
 <TransitionSeries.Transition presentation={fade()} timing={linearTiming({durationInFrames:.6*fps})}/>
 <TransitionSeries.Sequence name="08 · 活着" durationInFrames={7.6*fps} premountFor={fps}><CinemaHuman/></TransitionSeries.Sequence>
 <TransitionSeries.Transition presentation={fade()} timing={linearTiming({durationInFrames:.6*fps})}/>
 <TransitionSeries.Sequence name="09 · 代价" durationInFrames={7.6*fps} premountFor={fps}><CinemaCost/></TransitionSeries.Sequence>
 <TransitionSeries.Transition presentation={fade()} timing={linearTiming({durationInFrames:.6*fps})}/>
 <TransitionSeries.Sequence name="10 · 熵" durationInFrames={6.6*fps} premountFor={fps}><CinemaArrow/></TransitionSeries.Sequence>
 <TransitionSeries.Transition presentation={fade()} timing={linearTiming({durationInFrames:.6*fps})}/>
 <TransitionSeries.Sequence name="11 · 此刻" durationInFrames={7*fps} premountFor={fps}><CinemaRemember/></TransitionSeries.Sequence>
 </TransitionSeries>;};
