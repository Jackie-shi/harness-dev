# Harness Dev — 设计规格

## 概述

Harness 是一个 Claude Code / Codex plugin，通过 npx 分发安装。核心目标：为项目提供全托管开发体验 — 用户完成初始化后，Agent 自驱完成整个项目开发，用户只需在关键节点做决策。

整个工具只需要 Skills，不需要 CLI。原因：Harness 流程的每一步都需要 Agent 和用户多轮交互、带语境判断。CLI 唯一能做的是"按模板渲染死文件"，但模板渲染出来的是空壳子，关键内容还是要 Agent 进来填。

## 分发与安装

### npm 包

- 包名：`harness-dev`
- 入口：`npx harness-dev`
- 实现语言：Node.js (ESM)

### 安装流程

```
1. 欢迎信息 + 版本号
2. 选择平台：Claude Code / Codex
3. 选择 scope：Global / Local
4. 复制 skills 到目标路径
5. 输出安装成功 + 使用提示
```

### 平台路径

| 平台 | Global | Local |
|------|--------|-------|
| Claude Code | `~/.claude/skills/harness/` | `.claude/skills/harness/` |
| Codex | `~/.codex/skills/harness/` | `.codex/skills/harness/` |

installer 幂等 — 重复执行覆盖更新，不重复创建。

## Skills 设计

共 3 个用户可见的 skills：

| Skill | 类型 | 触发方式 |
|-------|------|----------|
| `harness-init` | 一次性 | `/harness-init` |
| `harness-run` | 持续性 | `/harness-run` |
| `harness-config` | 随时可用 | `/harness-config` |

---

## harness-init

项目初始化 skill。通过多轮对话收集项目信息，生成全套骨骼文件。

### 对话流程

**阶段零：环境就绪**

Agent 自动检测并处理：
1. 检测当前目录是否已有 Git 仓库（`git rev-parse --is-inside-work-tree`）
2. 如果无 Git：
   - 从 0 开始的项目 → `git init` + 创建 `.gitignore`（根据后续技术栈选择生成）
   - 已有项目无 Git → 询问用户确认后 `git init`，将现有文件作为 initial commit
3. 确认 Git 就绪后进入阶段一

**阶段一：项目概要（深度对话）**

核心原则：这是"梦想提取"而非"需求收集"。Agent 是思考伙伴，不是面试官。

对话策略：
- 每次只问一个问题，不要一次性抛出多个问题
- 优先用选择题降低用户回答成本，但开放式问题也可以
- 跟随用户的能量 — 用户强调什么就深挖什么
- 挑战模糊性 — 不接受含糊回答（"好用"是什么意思？"用户"是谁？"简单"怎么定义？）
- 让抽象变具体 — "走一遍使用流程"、"给我一个例子"、"那实际上长什么样？"
- 不要脚本式提问 — 根据用户回答自然地追问，而非按固定清单走

开场：先问一个开放问题 — "你想做什么？" 让用户倾倒他们的想法，不要打断。

然后跟随线索深挖：
- 动机："什么促使你想做这个？"、"你现在怎么解决这个问题？"
- 具体化："你说的 X 具体是什么样的？"、"给我举个例子"
- 澄清歧义："你说 Z 的时候，是指 A 还是 B？"
- 成功标准："你怎么知道这个东西做好了？"、"做完是什么样的？"

背景 checklist（Agent 内部检查，不要暴露给用户）：
- [ ] 在做什么（具体到能向陌生人解释）
- [ ] 为什么要做（驱动它的问题或欲望）
- [ ] 给谁用（哪怕只是自己）
- [ ] "做完"长什么样（可观察的结果）

当 Agent 认为已经理解清楚时，主动提出："我觉得我理解了你要做的东西，要不要我整理一下确认？" 如果用户说"还有"，继续深挖。

确认后收集结构化信息：
1. 项目名 + 一句话描述
2. 项目类型（Web / Desktop / Mobile）
3. 核心功能点列表（从对话中提炼，让用户确认）
4. 技术栈 — Agent 给出 2-3 个推荐方案，每个附带优劣势，用户选择
5. 远程仓库（可选 — 用户提供 remote URL 或跳过）

反模式（必须避免）：
- 清单式提问 — 不管用户说了什么都按固定顺序问
- 套话 — "你的核心价值是什么？"、"你的利益相关者是谁？"
- 审讯 — 连续发问不基于上一个回答
- 赶进度 — 为了快速进入"正事"而减少提问
- 浅层接受 — 拿到模糊回答就不追问了
- 过早约束 — 在理解想法之前就问技术栈

**阶段二：需求细化（逐个功能深入）**

基于阶段一确认的功能点，Agent 逐个深入。同样遵循"一次一个问题"原则：

对每个功能点：
1. 行为描述（behavior）— "这个功能具体做什么？用户怎么触发它？结果是什么？"
2. 验收标准（acceptance criteria）— "怎么算做好了？给我可测量的标准"
3. 验证命令（verification）— 根据技术栈自动推荐 lint/test 层级
4. 边界情况 — "如果 X 发生了怎么办？"、"输入为空呢？"

功能点全部细化后：
5. 功能间依赖关系（depends_on）— Agent 根据理解提出建议，用户确认
6. 划分 Stage — Agent 提出分期方案（最小可用路径优先），用户确认
7. 每个 Stage 的 goal 和 exit_criteria
8. HITL 配置 — Stage 边界是否暂停等用户确认
9. compact 退出阈值（默认 3，>3 给 warning）

### 输出物

| 文件 | 说明 |
|------|------|
| `AGENTS.md` | 入口路由文件（已存在则合并追加） |
| `DECISIONS.md` | 技术栈选型决策 + 理由 |
| `PROGRESS.md` | 初始化为 "init 完成" 状态 |
| `Makefile` | 通用骨架（setup / dev / check） |
| `.harness.yaml` | 运行时配置 |
| `docs/features.yaml` | 全部功能点定义 |
| `docs/roadmap.yaml` | Stage 排期 |
| `docs/architecture/` | 空目录占位 |

### 已有项目处理

- 如果项目已有 `AGENTS.md`、`Makefile` 等文件，采用合并追加策略
- Agent 先读取现有内容，在不破坏原有结构的前提下追加 Harness 相关 section

---

## harness-run

全自动开发循环 skill。用户触发后 Agent 自驱执行，直到退出条件满足。

### 启动阶段（自动 checkin）

1. 读 `.harness.yaml` → 加载配置
2. 读 `PROGRESS.md` → 确定当前位置（哪个 Stage、哪个 feature）
3. 读 `docs/roadmap.yaml` → 确认当前 Stage 目标和 exit_criteria
4. 读 `AGENTS.md` → 加载项目约束
5. 输出简短状态摘要："当前在 S1，已完成 F01/F02，下一个 F03"

### 循环体

```
pick_feature
  → 从 features.yaml 选 state=not_started 且 depends_on 已满足的下一个
  → 更新 state 为 in_progress

implement (TDD 硬约束)
  → 写测试 → 跑测试（红）→ 写实现 → 跑测试（绿）→ refactor
  → 每个逻辑单元一个 atomic commit

verify
  → 按 feature 的 verification 层级逐层跑（lint → test → integration）
  → 全部通过 → 更新 feature state 为 done
  → 失败 → 修复后重试，修不了则暂停并通知用户

update_progress
  → 更新 PROGRESS.md（当前 feature 完成，时间戳）
  → 检查当前 Stage 的所有 feature 是否完成
  → 如果 Stage 完成 → 检查 exit_criteria → 标记 Stage done

Stage 边界检查
  → 如果 hitl_on_stage_boundary=true → 暂停，输出 Stage 总结，等用户确认
  → 如果 hitl_on_stage_boundary=false → 自动进入下一个 Stage
```

### 退出条件

1. **全部完成** — 所有 Stage done → 输出项目完成总结
2. **阻塞** — 遇到无法自动解决的问题 → 暂停并说明原因
3. **compact 阈值** — 上下文 compact 达到配置次数（默认 3）→ 自动 handoff 并退出，提示用户开新会话
4. **用户手动中断** — 自动执行 handoff

### Handoff 行为

退出时自动执行：
- 更新 `PROGRESS.md` 到最新状态
- 在 `PROGRESS.md` 中写入交接摘要（当前在做什么、下一步是什么、有无阻塞）
- commit 所有变更

### 跨会话恢复

下次用户在新会话中再跑 `/harness-run`，从 PROGRESS.md 读取状态无缝继续，不需要用户复述上下文。

---

## harness-config

运行时配置修改 skill。

### 可配置项

| 配置项 | 默认值 | 说明 |
|--------|--------|------|
| `max_compacts` | 3 | compact 退出阈值，>3 给 warning |
| `hitl_on_stage_boundary` | true | Stage 边界是否暂停等用户确认 |

### 配置存储

单独文件 `.harness.yaml`，位于项目根目录。

### 交互方式

用户输入 `/harness-config`，Agent 展示当前配置并询问要修改哪项。修改后立即写入文件。

---

## 骨骼文件 Schema

### .harness.yaml

```yaml
max_compacts: 3
hitl_on_stage_boundary: true
```

### docs/features.yaml

```yaml
features:
  - id: F01
    title: 音频采集底座
    stage: S1
    state: not_started       # not_started | in_progress | done
    behavior: |
      主进程能从默认输入设备采集 16kHz 单声道 PCM 流，
      通过类型化 channel 暴露 start/stop/onChunk 接口给 renderer
    acceptance:
      - 启动采集后 100ms 内开始产生 chunk
      - 停止后无新 chunk 发出
      - 切换输入设备能无缝继续
    verification:
      - layer: l1
        cmd: make check-l1
      - layer: l2
        cmd: pnpm test src/audio/__tests__/ -- --run
    depends_on: []
    risk: low
```

### docs/roadmap.yaml

```yaml
stages:
  - id: S1
    goal: 走通端到端最小路径
    features: [F01, F02, F03, F04]
    exit_criteria:
      - 端到端 demo 可演示
      - 延迟 <800ms
    status: not_started      # not_started | in_progress | done

  - id: S2
    goal: 主流程可用 + 偏好设置
    features: [F05]
    exit_criteria:
      - 用户可配置模型/快捷键/设备
    status: not_started
```

### PROGRESS.md

```markdown
# Progress

## Current
- Stage: S1 (in_progress)
- Feature: F02 (in_progress)
- Last completed: F01 @ 2026-05-15

## History
- [2026-05-15] F01 done — 音频采集底座
- [2026-05-14] Init complete

## Handoff (最近一次交接)
- 当前正在实现 F02 的 PCM 解码逻辑
- 测试已写完，实现进行到一半
- 无阻塞
```

### DECISIONS.md

```markdown
# Decisions

## D01 — 技术栈选型：Electron + React + Whisper.cpp
- 日期: 2026-05-14
- 优势: 跨平台、本地推理无网络依赖
- 劣势: 包体积大、Electron 内存占用高
- 决定理由: 用户要求离线可用
```

---

## 项目结构

```
harness-dev/
├── bin/
│   └── install.mjs            # npx 入口，交互式安装
├── skills/
│   ├── harness-init/
│   │   └── SKILL.md
│   ├── harness-run/
│   │   └── SKILL.md
│   └── harness-config/
│       └── SKILL.md
├── templates/                  # 骨骼文件模板
│   ├── AGENTS.md.tmpl
│   ├── DECISIONS.md.tmpl
│   ├── PROGRESS.md.tmpl
│   ├── Makefile.tmpl
│   └── .harness.yaml.tmpl
├── platforms/
│   ├── claude-code.mjs        # CC 安装适配
│   └── codex.mjs              # Codex 安装适配
├── package.json
└── README.md
```

## 平台适配

### 共同点

- Skill 内容（SKILL.md）平台无关，都是 markdown 指令
- 骨骼文件格式统一
- Agent 行为一致

### 差异点

| 维度 | Claude Code | Codex |
|------|-------------|-------|
| Skill 安装路径 | `~/.claude/skills/` 或 `.claude/skills/` | `~/.codex/skills/` 或 `.codex/skills/` |
| 入口文件 | `AGENTS.md`（原生识别） | 待确认 Codex 约定 |
| Skill 格式 | SKILL.md (frontmatter + body) | 待确认是否一致 |

### 适配层职责

每个 platform adapter (`platforms/*.mjs`) 负责：
1. 确定安装目标路径
2. 如果 skill 格式有差异，做转换
3. 输出平台特定的使用提示

---

## 硬约束

- TDD 是硬约束，harness-run 中实施时必须先写测试再写实现
- WIP=1，同一时间只有一个 feature 处于 in_progress
- 每完成一个 feature 就 commit + 更新 PROGRESS.md
- installer 幂等
- 骨骼文件对已有项目采用合并追加策略
