import {interpolate,useCurrentFrame,useVideoConfig} from 'remotion';
import {Stage,Heading,Copy} from '../Stage';
import {Solar} from '../visuals/Solar';
export const CinemaSun=()=>{const frame=useCurrentFrame();const{fps}=useVideoConfig();return <Stage warm><div style={{position:'absolute',inset:0,transformOrigin:'82% 52%',scale:interpolate(frame,[0,7.6*fps],[1,1.045],{extrapolateLeft:'clamp',extrapolateRight:'clamp'})}}><Solar/></div><Heading warm>光，仍在抵达</Heading><Copy lines={['可太阳还在，','把氢拧成光。']} size={87} accent={1}/></Stage>;};
