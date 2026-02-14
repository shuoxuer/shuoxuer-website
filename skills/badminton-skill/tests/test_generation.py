import unittest
from src.engine import PromptEngine

class TestPromptEngine(unittest.TestCase):
    def setUp(self):
        self.engine = PromptEngine()

    def test_video_analysis_generation(self):
        prompt = self.engine.render_video_analysis(strictness=8, style="aggressive")
        self.assertIn("魔鬼模式 (Ruthless)", prompt)
        self.assertIn("搏杀进攻 (Aggressive)", prompt)
        self.assertIn("角色设定：斛教练", prompt)
        self.assertIn("角色设定：李指导", prompt)

    def test_style_analysis_generation(self):
        prompt = self.engine.render_style_analysis()
        self.assertIn("Function Fit (20分)", prompt)
        self.assertIn("JSON 输出结构", prompt)

    def test_chat_generation(self):
        history = "User asked about smash technique."
        prompt = self.engine.render_chat(history_context=history)
        self.assertIn("角色设定：AI 随身助教", prompt)
        self.assertIn(history, prompt)

if __name__ == '__main__':
    unittest.main()