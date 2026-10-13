import {interpolate,useCurrentFrame,useVideoConfig} from 'remotion';
import {SceneFrame,Words} from './SceneFrame';
import {TimeField} from '../visuals/TimeField';
import {C,sans} from '../design';
export const Cost=()=>{const frame=useCurrentFrame();const{fps}=useVideoConfig();return <SceneFrame chapter="代价" warm><TimeField kind="cost"/><Words lines={['秩序从不免费。','总有别处替它付账。']} size={79} accent={0}/><div style={{position:'absolute',left:112,top:1600,fontFamily:sans,fontSize:42,letterSpacing:2,color:C.dim,opacity:interpolate(frame,[2.8*fps,3.6*fps],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp'})}}>局部更有序，周围更分散。</div></SceneFrame>;};
