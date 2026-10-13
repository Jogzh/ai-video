import {Stage,Heading,Copy,Note} from '../Stage';
import {Flow} from '../visuals/Flow';
export const CinemaCost=()=> <Stage warm><Flow kind="cost"/><Heading warm>秩序的代价</Heading><Copy lines={['秩序从不免费。','总有别处，替它付账。']} size={76} accent={0}/><Note delay={2.8}>局部更有序，周围更分散。</Note></Stage>;
