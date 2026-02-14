# Badminton Prompts Generator

这是一个用于生成羽毛球 AI 提示词的标准组件。

## 快速上手

1.  **安装依赖**:
    ```bash
    pip install -r requirements.txt
    ```

2.  **生成视频分析 Prompt**:
    ```bash
    python cli.py --input examples/input_video.json
    ```
    结果将打印在控制台。

3.  **生成到文件**:
    ```bash
    python cli.py --input examples/input_video.json --output video_prompt.txt
    ```

## 开发指南
- 修改 `templates/` 下的 `.jinja2` 文件可调整 Prompt 内容。
- 修改 `src/engine.py` 可调整数据处理逻辑。
- 运行测试: `python -m unittest discover tests`
