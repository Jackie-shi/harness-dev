# harness-design — UI 视觉分层设计

## 概述

新增一个 skill `harness-design`，用于在 `harness-init` 之后、`harness-run` 之前进行 UI 视觉的层级化设计与确认。

核心思想：把"看视觉"拆成 5 个由粗到细的瓦片化层级，每层独立确认、独立迭代。避免一次性生成完整页面带来的 token 开销和返工成本。

不重复造轮子 — 调用现有 skill（`teach-impeccable`、`frontend-design`、`impeccable:critique`）做实际工作，本 skill 只负责流程编排。

## 触发与前置

**主触发方式：** harness-init 完成后，agent 检测项目类型为 Web / Desktop / Mobile 时主动提示：
> "这是个有 UI 的项目。要做出好看的产品，建议先完成视觉设计再开始开发。要现在进入 `/harness-design` 吗？"

- 用户确认 → 直接进入 design 流程
- 用户拒绝 → init 正常结束

**备用触发：** 用户手动 `/harness-design`（适用于 init 时跳过、或想重新进入 design 阶段的场景）

**前置条件：** 项目已经跑过 `/harness-init`，存在 `docs/features.yaml` 和 `docs/roadmap.yaml`

**适用范围：** Web / Desktop / Mobile。CLI / Library 类项目不适用 — 如果用户手动触发 `/harness-design`，告知用户跳过即可

## 流程

### 阶段 0：设计上下文沉淀

调用 `impeccable:teach-impeccable`（或自己跑等价流程）收集设计上下文：
- 用户画像
- 品牌个性
- 视觉方向（参考站、反参考、主题）
- 3-5 条设计原则

产出：写入 `AGENTS.md` 的 `## Design Context` section（追加，不覆盖）

### 阶段 1：五层瓦片化设计

逐层进行，每层完成后必须等用户确认才进入下一层。

| Layer | 内容 | 产物 |
|-------|------|------|
| L1 信息架构 | 每个页面的线框瓦片（灰块 + 文字标签，纯黑白） | `design/wireframes.html` |
| L2 导航流 | 页面跳转流程图 | `design/flow.md`（mermaid） |
| L3 视觉风格 | 色板 + 字体样本 + 组件瓦片（按钮/卡片/输入框等） | `design/styleguide.html` |
| L4 关键页面 | 1-2 个核心页面静态稿（应用 L3 风格到 L1 结构） | `design/preview-{page}.html` |
| L5 动效瓦片 | 各种动效 demo 模块（按钮 hover、卡片入场、页面切换、加载、toast 等） | `design/motion.html` |

每层规则：
- 用 `frontend-design` skill 生成代码（除 L2，L2 用 mermaid）
- 生成后告知用户产物路径，让用户在浏览器打开看
- 等用户反馈："OK 进入下一层" / "改 X / Y / Z" / "回退到上一层"
- 不主动跳层

### 阶段 2：与 harness-run 衔接

完成所有层后：
- 在 `AGENTS.md` 中追加一个 section，列出 design 产物路径，告知 harness-run 实现 UI feature 时必须读取这些作为视觉规范
- 提示用户："视觉设计完成。运行 `/harness-run` 开始开发。"

## 三类迭代的处理

### 第 1 类：同层微调
当前层内对话迭代，agent 改对应文件，用户重新看。不离开当前 layer。

### 第 2 类：回退上一层
当 agent 识别到用户反馈的本质是上一层的问题（例如在 L4 发现 L1 信息架构错了），主动提议：
> "你提到的这个问题其实涉及 L{N} 的信息架构。要回到 L{N} 调整吗？"

用户确认 → 从指定 layer 重新开始。后续 layer 的产物全部失效，需重做。

### 第 3 类：触发 init 修订

当 agent 识别到用户反馈涉及功能定义（features.yaml / roadmap.yaml）：
> "这个改动涉及功能定义。要进入需求修订模式吗？"

用户确认 → 进入**轻量 init 修订模式**：
- 不重新走 Phase 1（项目概要、技术栈），那些已经定型
- 只针对受影响的 feature 走 harness-init Phase 2 的细化流程（behavior / acceptance / verification / depends_on / edge cases）
- 如果涉及 stage 调整，更新 roadmap.yaml
- 修订完成后回到 design 流程，从**当前所在的 layer 重新开始**（而非从 L1）— 因为修订前用户是在某一层做反馈，后续层产物因 features 改变而失效，需重做；当前层及之前的层产物如果不受影响则保留

为支持这个，**harness-init 的 Phase 2 内容需要被抽成一个可独立引用的 section**，让 harness-design 在第 3 类迭代时能复用。

## 文件结构

```
project-root/
├── AGENTS.md                          # 追加 Design Context section
├── design/                            # 新增
│   ├── wireframes.html                # L1
│   ├── flow.md                        # L2 (mermaid)
│   ├── styleguide.html                # L3
│   ├── preview-{page-name}.html       # L4 (一个或多个)
│   └── motion.html                    # L5
├── docs/
│   ├── features.yaml                  # 第 3 类迭代可能修改
│   └── roadmap.yaml                   # 第 3 类迭代可能修改
└── PROGRESS.md                        # design 阶段状态记录
```

## 对其他 skill 的修改

### harness-init
1. 把 Phase 2 内容抽成可单独引用的 section（加锚点 / 子标题，让 harness-design 能引用）
2. 在 init 完成后，**自动检测项目类型**：
   - 如果是 Web / Desktop / Mobile：主动询问用户是否进入 `/harness-design`
     - 用户确认 → 直接进入 design 流程（等同于用户手动触发 `/harness-design`）
     - 用户拒绝 → init 正常结束，最后提示一句："后续可以随时运行 `/harness-design` 进入视觉设计阶段"
   - 如果是 CLI / Library：不提示 design，直接结束

### harness-run
1. 启动时检测 `design/` 目录是否存在
2. 实现 UI 相关 feature 时必须读取：
   - `design/styleguide.html` — 视觉规范
   - 对应页面的 `design/preview-{page}.html` — 静态参考
   - `design/motion.html` — 动效规范
3. 实现完成后调用 `impeccable:critique` 做设计审查，根据审查结果决定是否需要 polish

### README
- 在 `## How It Works` 中加入 design 阶段（init → design → run → next）
- 在 `## Commands` 表格加 `/harness-design`

## PROGRESS.md 状态记录

design 阶段进入时在 PROGRESS.md 的 Current section 标记当前所在 layer：

```markdown
## Current
- Phase: design
- Layer: L3 (visual style)
- Status: pending user review
```

完成后切回到原本的 stage/feature 状态。

## 不在范围内（YAGNI）

- 不做 Figma / 外部设计工具集成
- 不做实时预览服务器（用户用浏览器开 file:// 路径即可）
- 不做设计版本对比（用户依靠 git 历史）
- 不在 design 阶段做实际页面的功能开发（那是 harness-run 的事）

## 成功标准

- 用户能在不到一次完整页面生成的时间内完成 5 个层级的初次预览
- 任意一层的迭代不需要重做后面的层（除非用户主动选择）
- 第 3 类迭代不需要让用户重新回答"项目是什么"
- harness-run 实现的 UI 视觉风格与 design 阶段定义的风格一致
