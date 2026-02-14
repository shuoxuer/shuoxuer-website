import os
from datetime import datetime
from jinja2 import Environment, FileSystemLoader

class GreetingEngine:
    def __init__(self, template_dir=None):
        if template_dir is None:
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            template_dir = os.path.join(base_dir, 'templates')
        
        self.env = Environment(loader=FileSystemLoader(template_dir))
        
    def generate_greeting(self):
        now = datetime.now()
        month = now.month
        day = now.day
        
        template = self.env.get_template('greeting.jinja2')
        return template.render(month=month, day=day)
