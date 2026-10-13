import {AbsoluteFill,interpolate,useCurrentFrame,useVideoConfig} from 'remotion';
import {Stage,Copy,palette} from '../Stage';
import {Flow} from '../visuals/Flow';
import {serif} from '../../design';
export const CinemaRemember=()=>{const frame=useCurrentFrame();const{fps}=useVideoConfig();return <Stage warm><Flow kind="closing"/><div style={{position:'absolute',width:'100%',top:294,textAlign:'center',fontFamily:serif,fontSize:174,letterSpacing:20,color:palette.paper,opacity:interpolate(frame,[.3*fps,1.3*fps],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp'})}}>此刻</div><Copy lines={['所以此刻，','才值得被记住。']} left={410} width={1100} top={575} size={81} center accent={1} delay={1}/><AbsoluteFill style={{background:palette.ink,opacity:interpolate(frame,[6*fps,7*fps-1],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp'})}}/></Stage>;};
