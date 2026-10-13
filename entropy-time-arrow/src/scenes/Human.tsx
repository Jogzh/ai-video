import {SceneFrame,Words} from './SceneFrame';
import {WarmLife} from '../visuals/WarmLife';
export const Human=()=> <SceneFrame chapter="活着" warm><div style={{position:'absolute',inset:0,filter:'brightness(1.75)'}}><WarmLife kind="human"/></div><Words lines={['你把热散向身外，','把自己留在这里。']} size={79} accent={1}/></SceneFrame>;
