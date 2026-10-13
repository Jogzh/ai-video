import {interpolate,useCurrentFrame,useVideoConfig} from 'remotion';
import {SceneFrame,Words} from './SceneFrame';
import {TimeField} from '../visuals/TimeField';
import {serif} from '../design';
export const Opening=()=>{const frame=useCurrentFrame();const{fps}=useVideoConfig();return <SceneFrame chapter="时间的方向"><TimeField kind="opening"/><div style={{position:'absolute',left:112,top:310,fontFamily:serif,fontSize:150,letterSpacing:12,opacity:interpolate(frame,[0,1*fps],[0,1],{extrapolateRight:'clamp'})}}>时间</div><Words lines={['为什么只朝','一个方向走？']} size={90} delay={1.0}/></SceneFrame>;};
