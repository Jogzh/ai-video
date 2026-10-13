# Remotion 评估与采用决策

更新时间：2026-10-13（Asia/Shanghai）

## 结论

本项目后续应采用 Remotion 作为视频模板和程序化渲染层，FFmpeg 作为底层媒体处理工具。当前先完成内容与模板设计，不立即生成视频、不立即渲染。

## 为什么别人会用 Remotion

`#vibe知识大赏` 适合一种重复性很高的内容形态：每条视频的版式、字幕、转场、节奏和片尾基本稳定，只替换知识点、例子、配图和旁白。Remotion 可以把这些部分写成 React 组件和参数：

- 统一 9:16 尺寸、字体、边距和安全区。
- 用数据驱动多个场景、标题、卡片、图表和字幕。
- 同一套模板批量生成不同选题，便于 A/B 测试。
- 在 Studio 里先看预览，确认后再导出 MP4。
- 复杂字幕、图表、动态强调和节奏控制比直接拼接 FFmpeg 更容易维护。

## FFmpeg 和 Remotion 的分工

| 工具 | 适合做什么 |
| --- | --- |
| Remotion | 场景、动画、字幕、图表、模板、预览、批量渲染 |
| FFmpeg | 转码、抽帧、音频处理、格式兼容、最终媒体检查 |

## 现在为什么不立即 scaffold

当前还没有确定：

- 出镜/配音方式
- 首屏视觉风格
- 字幕密度和每条视频长度
- 是否需要人物、地图或数据图表

直接生成 Remotion 项目会先锁定一套实现细节，但不能解决账号定位和选题验证。前置阶段先沉淀 3 条脚本和一套分镜规范，再用 Remotion 建模板，成本更低。

## 何时开始安装运行时依赖

当以下条件满足时执行 `create-video` 或安装 `remotion` 运行时依赖：

1. 已选定首批 3 条题目。
2. 已确定统一的首帧、正文卡片、结尾关注承接。
3. 至少有一条完整旁白或字幕稿。
4. 确认需要代码生成，而不是手工剪辑。

## 已安装的官方 Agent Skills

来源：<https://github.com/remotion-dev/skills>

已安装到当前仓库 `.agents/skills/`，并生成 `skills-lock.json`：

- `remotion-best-practices`
- `remotion-create`
- `remotion-markup`
- `remotion-captions`
- `remotion-render`
- `remotion-studio`
- `remotion-docs`
- `remotion-multimedia`
- `remotion-interactivity`
- `remotion-maps`
- `remotion-saas`
- `remotion-upgrade`

这些是工作流知识，不等同于 Remotion npm 运行时；开始写视频代码时仍需在项目中安装对应 npm 包。

## 使用许可提醒

Remotion 当前采用分层许可：个人、3 人以内小团队、非营利组织和评估阶段可按其 Free License 使用；更大规模的营利组织需要单独的 Company License。真正用于商业化账号前，应按使用主体和规模复核官方许可。来源：<https://github.com/remotion-dev/remotion/blob/main/LICENSE.md>。
