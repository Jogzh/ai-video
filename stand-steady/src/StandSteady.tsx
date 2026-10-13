import React, {useLayoutEffect, useRef} from 'react';
import type {Caption} from '@remotion/captions';
import {AbsoluteFill, Easing, interpolate, Sequence, useCurrentFrame, useVideoConfig} from 'remotion';
import {createSceneTextures, drawScene, type SceneTextures} from './scene';

const ease = Easing.bezier(0.42, 0, 0.22, 1);
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

export const windAt = (seconds: number): number => {
  const envelope = interpolate(seconds,
    [0, 0.7, 3.3, 7.6, 12.0, 16.8, 19.2, 22.6, 28],
    [0.07, 0.13, 0.84, 0.84, 0.045, 0.07, 0.29, 0.065, 0.05],
    {...clamp, easing: ease});
  return Math.max(0, Math.min(1, envelope + Math.sin(seconds * 1.3) * 0.022 * envelope));
};

const Meadow: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const canvas = useRef<HTMLCanvasElement>(null);
  const textures = useRef<SceneTextures | null>(null);
  useLayoutEffect(() => {
    if (!textures.current) textures.current = createSceneTextures();
    const ctx = canvas.current?.getContext('2d');
    if (ctx) drawScene(ctx, textures.current, frame / fps, windAt(frame / fps));
  }, [frame, fps]);
  return <canvas ref={canvas} width={1920} height={1080} style={{position: 'absolute', inset: 0, width: '100%', height: '100%'}} />;
};

type PoemProps = {captions: Caption[]; emphasis?: boolean; closing?: boolean};
const Poem: React.FC<PoemProps> = ({captions, emphasis = false, closing = false}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const caption = captions.find(c => frame / fps * 1000 >= c.startMs && frame / fps * 1000 < c.endMs);
  if (!caption) return null;
  const localFrame = frame - caption.startMs / 1000 * fps;
  const captionFrames = (caption.endMs - caption.startMs) / 1000 * fps;
  const lines = caption.text.split('\n');
  return (
    <div style={{position: 'absolute', left: 180, top: emphasis ? 335 : closing ? 374 : 375, width: 880,
      color: '#f4f0db', fontFamily: '"Songti SC", "STSong", serif', fontWeight: 400, letterSpacing: emphasis ? 6 : 3,
      opacity: interpolate(localFrame, [0, 0.45 * fps, captionFrames - 0.32 * fps, captionFrames], [0, 1, 1, 0], clamp)}}>
      {lines.map((line, i) => (
        <div key={line} style={{
          fontSize: emphasis ? (i === 0 ? 112 : 92) : closing ? 65 : (i === 0 ? 74 : 66),
          lineHeight: emphasis ? 1.55 : 1.78,
          color: emphasis && i === 1 ? '#dbd0a4' : i === 0 ? '#f4f0db' : '#dbdfcf',
          whiteSpace: 'nowrap',
          translate: interpolate(localFrame, [i * 0.12 * fps, (0.7 + i * 0.12) * fps], ['0px 12px', '0px 0px'], {...clamp, easing: ease}),
          opacity: interpolate(localFrame, [i * 0.12 * fps, (0.5 + i * 0.12) * fps], [0, 1], clamp),
          textShadow: '0 2px 18px rgba(0, 15, 12, 0.16)',
        }}>{line}</div>
      ))}
    </div>
  );
};

export const StandSteady: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <AbsoluteFill style={{backgroundColor: '#102b28', overflow: 'hidden'}}>
      <Meadow />
      <div style={{position: 'absolute', left: 184, top: 154, color: '#d4d9bf', fontFamily: '"Songti SC", serif',
        fontSize: 39, fontWeight: 400, letterSpacing: 16,
        opacity: interpolate(frame, [0, 0.9 * fps], [0, 0.72], clamp)}}>站稳</div>
      <Sequence name="风渐强" from={0.5 * fps} durationInFrames={3.3 * fps} premountFor={fps}>
        <Poem captions={[{text: '风越强，\n草越贴近地面。', startMs: 0, endMs: 3300, timestampMs: null, confidence: null}]} />
      </Sequence>
      <Sequence name="顺势弯下" from={3.9 * fps} durationInFrames={4.0 * fps} premountFor={fps}>
        <Poem captions={[{text: '弯下去，\n它承受的风就小一些。', startMs: 0, endMs: 4000, timestampMs: null, confidence: null}]} />
      </Sequence>
      <Sequence name="慢慢抬起" from={8.0 * fps} durationInFrames={4.1 * fps} premountFor={fps}>
        <Poem captions={[{text: '等风过去，\n它又慢慢抬起头。', startMs: 0, endMs: 4100, timestampMs: null, confidence: null}]} />
      </Sequence>
      <Sequence name="稳定需要调整" from={12.2 * fps} durationInFrames={3.0 * fps} premountFor={fps}>
        <Poem emphasis captions={[{text: '稳定，\n需要调整。', startMs: 0, endMs: 3000, timestampMs: null, confidence: null}]} />
      </Sequence>
      <Sequence name="我们也一样" from={15.4 * fps} durationInFrames={2.2 * fps} premountFor={fps}>
        <Poem captions={[{text: '我们也一样。', startMs: 0, endMs: 2200, timestampMs: null, confidence: null}]} />
      </Sequence>
      <Sequence name="换一种姿态" from={17.7 * fps} durationInFrames={5.2 * fps} premountFor={fps}>
        <Poem captions={[{text: '环境变了，\n可以换一种姿态。', startMs: 0, endMs: 5200, timestampMs: null, confidence: null}]} />
      </Sequence>
      <Sequence name="守住方向" from={23.0 * fps} durationInFrames={5.0 * fps} premountFor={fps}>
        <Poem closing captions={[{text: '守住自己的方向，\n不必守住每一个动作。', startMs: 0, endMs: 5000, timestampMs: null, confidence: null}]} />
      </Sequence>
      <AbsoluteFill style={{pointerEvents: 'none', backgroundColor: '#0b1e1c',
        opacity: interpolate(frame, [0, 0.6 * fps, 27.35 * fps, 28 * fps - 1], [0.7, 0, 0, 0.85], clamp)}} />
    </AbsoluteFill>
  );
};
