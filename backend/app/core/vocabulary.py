
"""
附录 A: 核心术语标准库 (Standard Terminology Library)
AI 在生成分析报告和标签时，优先从以下分类中选取术语。
"""

STANDARD_TERMINOLOGY = {
    "基础技术类 (Basic Techniques)": [
        "正手握拍 (Forehand Grip)",
        "反手握拍 (Backhand Grip)",
        "转换握拍 (Grip Change)",
        "高远球 (Clear)",
        "吊球 (Drop Shot)",
        "劈吊 (Slice Drop)",
        "杀球 (Smash)",
        "跳杀 (Jump Smash)",
        "平抽球 (Drive)"
    ],
    "步法与移动类 (Footwork)": [
        "并步 (Side Step)",
        "交叉步 (Cross Step)",
        "垫步 (Lunge)",
        "启动步 (Split Step)",
        "回位 (Recovery)"
    ],
    "网前技术 (Net Play)": [
        "放网 (Net Shot)",
        "搓球 (Tumbling Net Shot)",
        "勾对角 (Cross Net Shot)",
        "扑球 (Net Kill)"
    ],
    "防守技术 (Defense)": [
        "挡网 (Block)",
        "挑球防守 (Defensive Lift)",
        "防守反抽 (Defensive Drive)",
        "反手防守 (Backhand Defense)"
    ],
    "发力与机制 (Biomechanics)": [
        "鞭打发力 (Whip Action)",
        "内旋发力 (Pronation)",
        "手腕爆发 (Wrist Snap)",
        "躯干旋转 (Body Rotation)",
        "重心转换 (Weight Transfer)"
    ],
    "战术与意识 (Tactics)": [
        "控制节奏 (Tempo Control)",
        "压后场 (Backcourt Pressure)",
        "拉开角度 (Creating Angles)",
        "连续进攻 (Continuous Attack)"
    ]
}

def get_terminology_string():
    """
    将术语库转换为 Prompt 友好的字符串格式
    """
    result = "## 核心术语标准库 (Standard Terminology)\n请在诊断时优先使用以下术语：\n"
    for category, terms in STANDARD_TERMINOLOGY.items():
        result += f"\n### {category}:\n"
        result += ", ".join(terms)
    return result
