import {interpolate,useCurrentFrame,useVideoConfig} from 'remotion';
import {SceneFrame,Words} from './SceneFrame';
import {TimeField} from '../visuals/TimeField';
export const Probability=()=>{const frame=useCurrentFrame();const{fps}=useVideoConfig();return <SceneFrame chapter="概率"><TimeField kind="probability"/><div style={{opacity:interpolate(frame,[3*fps,3.5*fps],[1,0],{extrapolateLeft:'clamp',extrapolateRight:'clamp'})}}><Words lines={['这不是惩罚。','是概率。']} size={94} accent={1} delay={.3}/></div><Words lines={['整齐的摆法太少。','散乱的可能，太多。']} size={75} accent={1} delay={3.6}/></SceneFrame>;};
