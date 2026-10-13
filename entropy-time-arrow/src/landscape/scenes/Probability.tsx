import {interpolate,useCurrentFrame,useVideoConfig} from 'remotion';
import {Stage,Heading,Copy,Note} from '../Stage';
import {Flow} from '../visuals/Flow';
export const CinemaProbability=()=>{const frame=useCurrentFrame();const{fps}=useVideoConfig();return <Stage><Flow kind="probability"/><Heading>概率</Heading><div style={{opacity:interpolate(frame,[2.9*fps,3.5*fps],[1,0],{extrapolateLeft:'clamp',extrapolateRight:'clamp'})}}><Copy lines={['这不是惩罚。','是概率。']} size={98} accent={1} delay={.3}/></div><Copy lines={['整齐的摆法太少。','散乱的可能，太多。']} size={79} accent={1} delay={3.6}/><Note delay={5.2}>于是，世界更容易散开。</Note></Stage>;};
