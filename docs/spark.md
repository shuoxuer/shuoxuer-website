# Badminton AI Coach (羽球智能私教) - 项目规范与实现指南 (spark.md)

## 1. 项目概述 (Project Overview)

*   **项目名称**: Badminton AI Coach (lssq)
*   **版本**: 2.14 (基于技术设计文档 v2.14)
*   **核心目标**: 构建一个基于 Google Gemini API 的羽毛球垂直领域智能分析平台。用户通过上传打球视频或个人穿搭图片，获取专业、个性化且具有连续性的指导建议。
*   **核心价值主张**:
    *   **多维度分析**: 斛教练 (技术)、李指导 (战术)、小安 (心理) 三维指导。
    *   **成长追踪**: 具备“记忆”能力，基于历史表现提供进阶建议。
    *   **专业背书**: 挂载 BWF 规则库与专业教材 (RAG)。
    *   **闭环督导**: 智能生成 14 天训练日程。
    *   **球场风尚**: OOTD 六维评分体系 (功能、身材、配色、质感、风格、上镜)。
*   **模块生态联动**:
    *   穿搭 -> 视频 (视觉锚点)
    *   视频 -> 知识库 (微课推荐)
    *   视频 -> 日程 (训练计划)

---

## 2. 系统架构 (System Architecture)

### 2.1 技术栈 (Tech Stack)

*   **Frontend**: Next.js (React) - 响应式 Web 应用。
*   **Backend**: FastAPI (Python) - 异步 API 服务。
*   **AI Engine**: Google Gemini 2.5 Flash (主力), Gemini 1.5 Pro (推理).
*   **RAG Framework**: LangChain (规划中).
*   **Database**:
    *   当前: Local JSON Storage (原型阶段).
    *   目标: PostgreSQL (用户/业务数据) + Pinecone/Chroma (向量数据).
*   **Task Queue**: Celery + Redis (规划中，用于异步分析).

### 2.2 架构图

```mermaid
graph TD
    User[用户 (Browser)] <--> Frontend[Frontend (Next.js)]
    Frontend <--> API[Backend API (FastAPI)]
    API <--> Storage[(JSON/DB)]
    API <--> Gemini[Google Gemini API]
    API -.-> RAG[RAG Engine (LangChain)]
```

---

## 3. 核心功能设计 (Core Features)

### 3.1 视频技术分析 (Video Studio)

*   **流程状态机**: Idle -> Preview -> Analyzing -> Completed.
*   **模式**:
    *   **模式 A (Timeline)**: 实时流式点评，与视频进度同步。
    *   **模式 B (Summary)**: 深度整场复盘 (动作描述、优点、改进建议)。
*   **交互**: 播放器支持倍速/逐帧；右侧展示分析结果。

### 3.2 虚拟教练矩阵 (Coach Persona)

| 教练代号 | 角色定位 | 侧重点 | 风格特点 | 可调参数 |
| :--- | :--- | :--- | :--- | :--- |
| **斛教练** | 技术型 | 动作规范、生物力学 | 严厉度 0-10 (慈母/严师/魔鬼/地狱) | Strictness Slider |
| **李指导** | 战术型 | 线路、预判、球商 | 风格 (稳健/搏杀) | Tactical Toggle |
| **小安** | 心理/激励 | 情绪价值、鼓励 | 热情、暖心 | N/A |

### 3.3 穿搭风尚点评 (Style Studio)

*   **核心评价体系 (六维雷达图)**: 总分 100 分。
    1.  **Function Fit (20分)**: 适配性。
    2.  **Silhouette (20分)**: 身材比例。
    3.  **Color Harmony (15分)**: 配色。
    4.  **Material & Detail (15分)**: 质感。
    5.  **Style Identity (15分)**: 风格。
    6.  **Camera Presence (15分)**: 上镜。
*   **输出**: 动态雷达图 + 风格标签 + 改进建议。

### 3.4 智能功能
*   **智能诊断卡片**: 交互式 Tag (如“启动步”)，点击弹出原理和训练推荐。
*   **训练督导**: 生成 14 天 JSON 计划。
*   **AI 随身助教**: 常驻对话助手，结合历史档案回答问题。

---

## 4. 接口与数据规范 (API & Data)

### 4.1 核心数据结构

#### OOTD Analysis Result (JSON)
```json
{
  "total_score": 88,
  "radar_chart": {
    "function_fit": 18,
    "silhouette": 16,
    "color_harmony": 14,
    "material_detail": 12,
    "style_identity": 14,
    "camera_presence": 14
  },
  "style_tags": ["专业训练", "硬朗"],
  "one_line_summary": "评价...",
  "improvement_tips": "建议..."
}
```

#### Video Analysis Result (JSON)
```json
{
  "analysis_report": { ... },
  "coach_advice": { ... },
  "top_issues": [
    {
      "tag_name": "启动步 (Split Step)",
      "severity": "high",
      "color_code": "red",
      "diagnosis": "击球瞬间脚后跟完全着地...",
      "principle": "启动步利用肌腱的弹性能（SSC）...",
      "drill_recommendation": "原地分腿跳 3组x20次",
      "resource_link": "羽毛球启动步教学"
    }
  ]
}
```

---

## 5. Prompt 工程策略

### 5.1 全局守门员 (The Gatekeeper)
所有 Prompt 前置指令：限制在羽毛球运动、装备、训练、穿搭范围内。

### 5.2 核心术语标准库 (Standard Terminology)
基于 **附录 A** 建立 `STANDARD_TERMINOLOGY` 常量，强制 AI 在诊断时使用标准术语（如 'Whip Action', 'Pronation'），确保数据一致性。

### 5.3 训练推荐闭环 (Drill Loop)
1.  **Diagnosis**: 识别核心病灶。
2.  **Mapping**: 映射到训练法 (AI 内置知识库)。
3.  **Prescription**: 生成具体处方 (组数 x 次数)。

### 5.4 动态偏好注入
*   **Hu_Strictness**: Low (Encouraging) vs High (Critical).
*   **Li_Style**: Conservative (Safe shots) vs Aggressive (Risky smashes).

---

## 6. 开发与部署

### 目录结构
```
backend/
├── app/
│   ├── core/
│   │   └── vocabulary.py  # 核心术语库
...
```

### 环境变量 (.env)
`GOOGLE_API_KEY=...`

---

## 8. 需求变更记录 (Change Log)

### 2026-01-30 (Update 4)
*   **新要求**: 完善智能诊断卡片、训练推荐闭环及 AI 随身助教功能。
*   **执行**:
    1.  建立 `backend/app/core/vocabulary.py` 核心术语库。
    2.  更新 Prompt 策略，强制使用标准术语并输出 `top_issues` 完整结构 (含原理、推荐、链接)。
    3.  新增 `/chat` 接口，实现 AI 随身助教 (Pocket Assistant)。
    4.  更新 `spark.md` 记录。

### 2026-01-30 (Update 3)
*   **新要求**: 根据《技术设计文档 v2.14》更新项目规范。
*   **执行**:
    1.  更新 `spark.md` 架构描述，引入 PostgreSQL/RAG 规划。
    2.  更新功能模块：增加六维穿搭评分、教练矩阵参数化、智能诊断卡片。
    3.  更新 Prompt 策略：加入 Gatekeeper 和动态风格注入。


### 2026-01-30 (Update 2)
*   **新要求**: 汇总最近一个月的用户互动问题到 `huizong.txt`。
*   **执行**: 生成 `huizong.txt`，包含完整对话记录。

### 2026-01-30 (Update 1)
*   **新要求**: 创建独立文件夹存放 `spark.md`，并建立需求变更记录机制。
*   **执行**: 创建 `docs/`，移动文件，新增 Change Log。
