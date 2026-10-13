# ai-video

用于抖音「Vibe知识大赏」活动的内容研究、脚本、素材和视频生成工作区。

## 目标

围绕活动规则制作可持续发布的知识类短视频，持续测试选题、开头、节奏和互动设计，目标是提升有效关注。

## 环境

- Python 3
- Node.js
- FFmpeg
- Remotion：视频编排、动画和预览

## 视频制作规范

后续视频制作遵循 [视频视觉与动态设计规范](docs/video-style-guide.md)。构图、文字位置与运动按镜头内容设计，统一字体、配色和运动语言，同时保留不同段落的节奏与留白。仓库根目录的 `AGENTS.md` 会提醒制作任务先阅读这份规范。

## 目录

- `docs/`：活动研究、选题和发布策略
- `src/`：脚本与生成代码
- `assets/`：素材
- `output/`：本地生成的视频（默认不提交）
- `scripts/`：环境检查和批处理脚本
- `.agents/skills/`：Remotion 官方 Agent Skills

## 已有视频项目

| 项目 | 内容 | 启动预览 |
| --- | --- | --- |
| [entropy-short](entropy-short/README.md) | 14.4 秒竖版时间与熵短片，含声音设计 | 在项目目录运行 `npm install`、`npm run dev` |
| [entropy-time-arrow](entropy-time-arrow/README.md) | 74 秒横版时间箭头短片 | 在项目目录运行 `npm install`、`npm run studio` |
| [stand-steady](stand-steady/README.md) | 28 秒横版植物意象短片 | 在项目目录运行 `npm install`、`npm run studio` |

源码、配置及运行必需的本地资源随仓库保存。依赖、导出视频、QA 截图和可再生成的音频中间文件不进入 Git。各项目的尺寸、字体、检查与导出方式见对应 README。
