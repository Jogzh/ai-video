import {Stage,Heading,Copy,Note} from '../Stage';
import {Flow} from '../visuals/Flow';
export const CinemaArrow=()=> <Stage><Flow kind="arrow"/><Heading>热力学时间箭头</Heading><Copy lines={['时间的箭头，','指向整体熵增。']} size={86} accent={1}/><Note delay={2}>在孤立系统中，整体熵不减。</Note></Stage>;
