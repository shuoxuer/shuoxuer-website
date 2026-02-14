# Badminton Prompts Skill

本 Skill 封装了羽毛球相关的 AI 提示词生成逻辑，支持视频分析、穿搭点评和日常对话场景。

## 用途
解决“如何为羽毛球 AI 教练生成高质量、风格统一的 System Prompt”的问题。通过模板化管理，确保不同场景下的 AI 人设（斛教练、李指导、小安）一致性。

## 输入输出

### 输入
JSON 格式的配置，包含 `template_name` 和 `parameters`。

**示例输入 (JSON):**
```json
{
  "template_name": "video_analysis",
  "parameters": {
    "strictness": 8,
    "style": "aggressive"
  }
}
```

### 输出
生成的 Prompt 字符串（通常保存为 `.txt` 或 `.md` 文件）。

## 执行步骤

1.  **安装依赖**: `pip install -r requirements.txt`
2.  **准备输入**: 创建一个输入 JSON 文件（如 `input.json`）。
3.  **运行 CLI**:
    ```bash
    python cli.py --input examples/input_video.json --output output.txt
    ```
4.  **查看结果**: 查看 `output.txt` 中的生成内容。

## 错误处理
- 如果 `template_name` 不存在，CLI 会报错并列出可用模板。
- 如果 `parameters` 缺少必要字段，将使用默认值（代码中定义）。
- 如果模板渲染失败，会抛出 Jinja2 异常。

## 目录结构
- `src/`: 核心逻辑 (PromptEngine)
- `templates/`: Jinja2 模板文件
- `examples/`: 输入样例
- `tests/`: 单元测试
