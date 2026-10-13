# 工具与工程准备

## 当前已完成

- Git 仓库已初始化，默认分支为 `main`。
- FFmpeg 已通过 Homebrew 安装，可用于后续转码、拼接、抽帧和音频处理。
- 已建立 `assets/`、`src/`、`scripts/`、`docs/`、`output/` 目录。
- 已加入 `scripts/check_env.sh`，用于检查基础环境。

## Remotion 决策

已确认后续采用 Remotion 作为模板和程序化渲染层，FFmpeg 继续负责底层媒体处理。当前只安装官方 Agent Skills，不立即 scaffold 或渲染视频；具体理由和启动条件见 [`remotion-decision.md`](./remotion-decision.md)。

## 后续可选工具

- FFmpeg：确定保留，用于媒体基础处理。
- 字幕生成：先用脚本/字幕文件验证，不急于绑定具体 SDK。
- 图像生成：仅在选题需要原创插图或背景时使用。
- Remotion Agent Skills：已从 `remotion-dev/skills` 安装到当前仓库。
- Remotion npm 运行时：等首批脚本和视觉模板确定后安装。
