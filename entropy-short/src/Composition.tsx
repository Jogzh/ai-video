import {useLayoutEffect, useRef} from 'react';
import {Audio} from '@remotion/media';
import {loadFont} from '@remotion/fonts';
import {TransitionSeries, linearTiming} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';
import {AbsoluteFill, Easing, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {TimeScene} from './scenes/TimeScene';
import {GlassScene} from './scenes/GlassScene';
import {ProbabilityScene} from './scenes/ProbabilityScene';
import {MemoryScene} from './scenes/MemoryScene';
import {noise} from './scenes/canvas';

loadFont({family: 'FilmSong', url: staticFile('fonts/FilmSong.woff2'), format: 'woff2'});
loadFont({family: 'FilmDidot', url: staticFile('fonts/FilmDidot.woff2'), format: 'woff2'});

export type EntropyProps = {voiceover: boolean};
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

const FilmGrain = () => {
  const canvas = useRef<HTMLCanvasElement>(null);
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const grainFrame = Math.floor(frame * 30 / fps);
  useLayoutEffect(() => {
    const ctx = canvas.current?.getContext('2d');
    if (!ctx) return;
    const pixels = ctx.createImageData(360, 640);
    for (let i = 0; i < 360 * 640; i++) {
      const value = noise(i + 91821) * 255;
      pixels.data[i * 4] = value;
      pixels.data[i * 4 + 1] = value;
      pixels.data[i * 4 + 2] = value;
      pixels.data[i * 4 + 3] = 255;
    }
    ctx.putImageData(pixels, 0, 0);
  }, []);
  return <AbsoluteFill style={{pointerEvents: 'none', opacity: 0.018, mixBlendMode: 'screen', overflow: 'hidden'}}>
    <canvas ref={canvas} width={360} height={640} style={{width: 1096, height: 1948, translate: `${-(grainFrame % 4) * 3}px ${-(grainFrame % 7) * 3}px`, imageRendering: 'auto'}} />
  </AbsoluteFill>;
};

type TitleProps = {first: string; second: string; note: string; seconds: number; warm?: boolean; opening?: boolean};
const SceneTitle = ({first, second, note, seconds, warm = false, opening = false}: TitleProps) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const entrance = opening ? 1 : interpolate(frame, [0.2 * fps, 0.65 * fps], [0, 1], {...clamp, easing: Easing.bezier(0.16, 1, 0.3, 1)});
  const exit = interpolate(frame, [(seconds - 0.18) * fps, seconds * fps], [1, 0], clamp);
  return <AbsoluteFill style={{opacity: entrance * exit, fontFamily: 'FilmSong, Songti SC, serif', color: '#f3eee4'}}>
    <div style={{position: 'absolute', top: 1264, left: 80, right: 80, textAlign: 'center', translate: `0 ${interpolate(frame, [0, 0.75 * fps], [opening ? 0 : 20, 0], {...clamp, easing: Easing.bezier(0.16, 1, 0.3, 1)})}px`}}>
      <div style={{fontFamily: 'FilmDidot, Didot, serif', fontSize: 23, letterSpacing: 5, color: warm ? '#b99b70' : '#829ba7', marginBottom: 39, lineHeight: 1.2}}>{note}</div>
      <div style={{fontSize: 82, lineHeight: 1.48, fontWeight: 400, letterSpacing: 5, whiteSpace: 'nowrap'}}>{first}</div>
      <div style={{fontSize: second.length > 8 ? 78 : 88, lineHeight: 1.48, fontWeight: 400, letterSpacing: 4, color: warm ? '#e4c795' : '#f3eee4', opacity: opening ? 1 : interpolate(frame, [0.35 * fps, 0.9 * fps], [0, 1], {...clamp, easing: Easing.bezier(0.16, 1, 0.3, 1)})}}>{second}</div>
    </div>
  </AbsoluteFill>;
};

export const EntropyFilm = ({voiceover}: EntropyProps) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return <AbsoluteFill style={{backgroundColor: '#030609', overflow: 'hidden'}}>
    <TransitionSeries>
      <TransitionSeries.Sequence name="01 · 时间的方向" durationInFrames={3.4 * fps} premountFor={fps}>
        <TimeScene />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={linearTiming({durationInFrames: 0.2 * fps})} />
      <TransitionSeries.Sequence name="02 · 不可逆" durationInFrames={3.6 * fps} premountFor={fps}>
        <GlassScene />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={linearTiming({durationInFrames: 0.2 * fps})} />
      <TransitionSeries.Sequence name="03 · 概率" durationInFrames={3.7 * fps} premountFor={fps}>
        <ProbabilityScene />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={linearTiming({durationInFrames: 0.2 * fps})} />
      <TransitionSeries.Sequence name="04 · 此刻" durationInFrames={4.3 * fps} premountFor={fps}>
        <MemoryScene />
      </TransitionSeries.Sequence>
    </TransitionSeries>

    <FilmGrain />
    <div style={{position: 'absolute', top: 143, left: 95, right: 95, display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#a8b1b1', fontFamily: 'FilmSong, Songti SC, serif', fontSize: 28, letterSpacing: 6, opacity: 0.76}}>
      <span>时间的方向</span><span style={{fontFamily: 'FilmDidot, Didot, serif', color: '#bb9d6d', fontSize: 27, letterSpacing: 2}}>Ⅰ</span>
    </div>

    <Sequence name="文案 · 时间" durationInFrames={3.2 * fps} premountFor={fps}>
      <SceneTitle first="时间，为什么" second="只朝一个方向走？" note="THE ARROW OF TIME" seconds={3.2} opening />
    </Sequence>
    <Sequence name="文案 · 碎裂" from={3.2 * fps} durationInFrames={3.4 * fps} premountFor={fps}>
      <SceneTitle first="杯子碎了" second="不会自己拼回去" note="IRREVERSIBLE" seconds={3.4} />
    </Sequence>
    <Sequence name="文案 · 概率" from={6.6 * fps} durationInFrames={3.5 * fps} premountFor={fps}>
      <SceneTitle first="这不是惩罚" second="是概率" note="PROBABILITY" seconds={3.5} warm />
    </Sequence>
    <Sequence name="文案 · 此刻" from={10.1 * fps} durationInFrames={4.3 * fps} premountFor={fps}>
      <SceneTitle first="所以此刻" second="才值得被记住" note="THIS MOMENT" seconds={4.3} warm />
    </Sequence>

    <div style={{position: 'absolute', bottom: 154, left: 95, right: 95, display: 'flex', alignItems: 'center', gap: 25, opacity: 0.56}}>
      <div style={{height: 1, width: 145, backgroundColor: '#62707a'}}><div style={{height: 1, width: `${Math.min(100, frame / (14.4 * fps - 1) * 100)}%`, backgroundColor: '#d1b17c'}} /></div>
      <span style={{fontFamily: 'FilmDidot, Didot, serif', fontSize: 20, color: '#939995', letterSpacing: 4}}>ENTROPY</span>
    </div>
    <Audio name="原创氛围与声音设计" src={staticFile(voiceover ? 'audio/film-mix.wav' : 'audio/sound-design.wav')} premountFor={fps} />
    <AbsoluteFill style={{pointerEvents: 'none', backgroundColor: '#030609', opacity: interpolate(frame, [14.15 * fps, 14.4 * fps], [0, 0.8], clamp)}} />
  </AbsoluteFill>;
};
