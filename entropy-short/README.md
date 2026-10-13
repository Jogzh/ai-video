# 时间的方向 · 14.4 秒视觉样片

1080 × 1920，9:16，60 fps，864 帧。四个原创程序动画镜头，从冷蓝玻璃过渡到暖金色日冕与年轮；字幕以宋体呈现，配原创环境音、玻璃碎裂声和铃光。

## 预览

```sh
npm run dev
```

打开终端打印的 Studio 地址，选择 `Entropy`。`Entropy-Voice` 是附带本机中文男声的旁白备选。默认样片使用字幕与原创声音设计，旁白可后续单独替换。

所有画面、字体和音频资源均在本地，播放时无需调用在线生成服务。

## 文案与分镜

| 时间 | 文案 | 镜头 |
| --- | --- | --- |
| 0–3.2 秒 | 时间，为什么只朝一个方向走？ | 玻璃沙漏、金色砂粒、缓慢推进 |
| 3.2–6.6 秒 | 杯子碎了，不会自己拼回去。 | 玻璃杯碎成大小不一的三维碎片 |
| 6.6–10.1 秒 | 这不是惩罚，是概率。 | 有序星晶格展开成星云 |
| 10.1–14.4 秒 | 所以此刻，才值得被记住。 | 金色日冕与年轮纹理，尘埃沉入光环 |

镜头之间有 0.2 秒叠化，镜头独立注册于 `Scenes` 文件夹，可单独预览和修改。每帧由 Remotion 时间驱动，粒子分布固定，拖动时间轴和导出时保持一致。

这版用于验证画面与节奏，保留科学诗的意象。长版再补上“无序的微观状态数量更多”的解释，以及孤立系统总熵与局部秩序的区别。

## 修改与音频

- `src/Composition.tsx`：文案、时间轴、字体、音频选择。
- `src/scenes/`：四个镜头的绘制与动画。
- `public/audio/sound-design.wav`：14.4 秒原创氛围与音效。
- `public/audio/film-mix.wav`：包含中文旁白的完整混音。
- `public/audio/voiceover.wav`：独立旁白，来自 macOS Eddy 中文男声。
- `scripts/build-sound.py`、`scripts/build-voice.py`：声音的生成脚本。
- `public/fonts/`：本机 Songti SC Regular 和 Didot Regular 的 WOFF2 文案子集，总计约 23 KB；增加中文文案时需更新字体子集。

## 检查与导出

```sh
npm run lint
```

需要导出时，在 Studio 点击 Render，或使用：

```sh
npx remotion render src/index.ts Entropy ../output/entropy-1080p-60fps.mp4 --codec=h264 --crf=17 --image-format=png --audio-bitrate=320k
```

旁白版本使用 `Entropy-Voice`。本机已安装 Chrome 时，可指定 `--browser-executable='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'`。

Remotion 使用许可见 [官方条款](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md)。
