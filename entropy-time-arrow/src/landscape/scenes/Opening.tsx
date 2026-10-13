import {Stage,Heading,Copy} from '../Stage';
import {Flow} from '../visuals/Flow';
export const CinemaOpening=()=> <Stage><Flow kind="time"/><Heading>时间的方向</Heading><Copy lines={['时间']} top={329} size={176} delay={.3}/><Copy lines={['为什么只朝','一个方向走？']} top={574} size={79} delay={1.0}/></Stage>;
