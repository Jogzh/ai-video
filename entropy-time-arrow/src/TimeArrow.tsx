import {useVideoConfig} from 'remotion';
import {TransitionSeries,linearTiming} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';
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
export const TimeArrow=()=>{const{fps}=useVideoConfig();return <TransitionSeries>
 <TransitionSeries.Sequence name="01 · 时间的方向" durationInFrames={6.5*fps} premountFor={fps}><Opening/></TransitionSeries.Sequence>
 <TransitionSeries.Transition presentation={fade()} timing={linearTiming({durationInFrames:.5*fps})}/>
 <TransitionSeries.Sequence name="02 · 破碎" durationInFrames={6.5*fps} premountFor={fps}><Cup/></TransitionSeries.Sequence>
 <TransitionSeries.Transition presentation={fade()} timing={linearTiming({durationInFrames:.5*fps})}/>
 <TransitionSeries.Sequence name="03 · 扩散" durationInFrames={6*fps} premountFor={fps}><Smoke/></TransitionSeries.Sequence>
 <TransitionSeries.Transition presentation={fade()} timing={linearTiming({durationInFrames:.5*fps})}/>
 <TransitionSeries.Sequence name="04 · 远去" durationInFrames={6*fps} premountFor={fps}><Photons/></TransitionSeries.Sequence>
 <TransitionSeries.Transition presentation={fade()} timing={linearTiming({durationInFrames:.5*fps})}/>
 <TransitionSeries.Sequence name="05 · 概率" durationInFrames={8.5*fps} premountFor={fps}><Probability/></TransitionSeries.Sequence>
 <TransitionSeries.Transition presentation={fade()} timing={linearTiming({durationInFrames:.5*fps})}/>
 <TransitionSeries.Sequence name="06 · 燃烧" durationInFrames={6.5*fps} premountFor={fps}><Sun/></TransitionSeries.Sequence>
 <TransitionSeries.Transition presentation={fade()} timing={linearTiming({durationInFrames:.5*fps})}/>
 <TransitionSeries.Sequence name="07 · 生长" durationInFrames={6*fps} premountFor={fps}><Rings/></TransitionSeries.Sequence>
 <TransitionSeries.Transition presentation={fade()} timing={linearTiming({durationInFrames:.5*fps})}/>
 <TransitionSeries.Sequence name="08 · 活着" durationInFrames={7*fps} premountFor={fps}><Human/></TransitionSeries.Sequence>
 <TransitionSeries.Transition presentation={fade()} timing={linearTiming({durationInFrames:.5*fps})}/>
 <TransitionSeries.Sequence name="09 · 代价" durationInFrames={7*fps} premountFor={fps}><Cost/></TransitionSeries.Sequence>
 <TransitionSeries.Transition presentation={fade()} timing={linearTiming({durationInFrames:.5*fps})}/>
 <TransitionSeries.Sequence name="10 · 熵的方向" durationInFrames={6*fps} premountFor={fps}><Arrow/></TransitionSeries.Sequence>
 <TransitionSeries.Transition presentation={fade()} timing={linearTiming({durationInFrames:.5*fps})}/>
 <TransitionSeries.Sequence name="11 · 此刻" durationInFrames={7*fps} premountFor={fps}><Remember/></TransitionSeries.Sequence>
 </TransitionSeries>;};
