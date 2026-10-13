import {interpolate,useCurrentFrame,useVideoConfig} from 'remotion';
import {SceneFrame,Words} from './SceneFrame';
import {TimeField} from '../visuals/TimeField';
import {C,sans} from '../design';
export const Arrow=()=>{const frame=useCurrentFrame();const{fps}=useVideoConfig();return <SceneFrame chapter="熵的方向"><TimeField kind="arrow"/><Words lines={['时间的箭头，','指向整体熵增的方向。']} size={69} accent={1}/><div style={{position:'absolute',left:112,top:1580,fontFamily:sans,fontSize:36,letterSpacing:1,color:C.dim,opacity:interpolate(frame,[2*fps,2.8*fps],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp'})}}>孤立系统的整体熵不减</div></SceneFrame>;};
