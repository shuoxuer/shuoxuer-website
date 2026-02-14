import unittest
from datetime import datetime
from src.engine import GreetingEngine

class TestGreetingEngine(unittest.TestCase):
    def setUp(self):
        self.engine = GreetingEngine()

    def test_greeting_format(self):
        greeting = self.engine.generate_greeting()
        now = datetime.now()
        expected_part = f"{now.month}月{now.day}号"
        
        self.assertIn("你好，我是斛教练", greeting)
        self.assertIn(expected_part, greeting)
        self.assertIn("我在合肥", greeting)

if __name__ == '__main__':
    unittest.main()