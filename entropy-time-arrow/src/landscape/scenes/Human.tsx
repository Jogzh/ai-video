import {Stage,Heading,Copy,Note} from '../Stage';
import {Living} from '../visuals/Living';
export const CinemaHuman=()=> <Stage warm><Living kind="human"/><Heading warm>活着</Heading><Copy lines={['你还在，','把热散向身外。']} size={87} accent={1}/><Note delay={2.6}>用流动的能量，维持自己。</Note></Stage>;
