import {AbsoluteFill,interpolate,useCurrentFrame,useVideoConfig} from 'remotion';
import {SceneFrame,Words} from './SceneFrame';
import {TimeField} from '../visuals/TimeField';
import {C} from '../design';
export const Remember=()=>{const frame=useCurrentFrame();const{fps}=useVideoConfig();return <SceneFrame chapter="此刻" warm><TimeField kind="closing"/><Words lines={['所以此刻，','才值得被记住。']} size={88} accent={1} delay={.8}/><AbsoluteFill style={{background:C.ink,opacity:interpolate(frame,[6*fps,7*fps-1],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp'})}}/></SceneFrame>;};
