import {interpolate,useCurrentFrame,useVideoConfig,Easing} from 'remotion';
import {Stage,Heading,Copy} from '../Stage';
import {Porcelain} from '../visuals/Porcelain';
export const CinemaCup=()=>{const frame=useCurrentFrame();const{fps}=useVideoConfig();return <Stage><div style={{position:'absolute',inset:0,transformOrigin:'74% 76.7%',scale:interpolate(frame,[0,1.6*fps,3.2*fps,7.6*fps],[1.5,1.5,1.25,1.25],{extrapolateLeft:'clamp',extrapolateRight:'clamp',easing:Easing.bezier(.3,0,.3,1)})}}><Porcelain/></div><Heading>不可逆</Heading><Copy lines={['杯子碎了，','不会自己拼回去。']} size={83} delay={2.45}/></Stage>;};
