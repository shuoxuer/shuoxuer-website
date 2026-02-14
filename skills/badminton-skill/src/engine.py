import os
from jinja2 import Environment, FileSystemLoader

class PromptEngine:
    def __init__(self, template_dir=None):
        if template_dir is None:
            # Default to 'templates' directory relative to this file's parent
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            template_dir = os.path.join(base_dir, 'templates')
        
        self.env = Environment(loader=FileSystemLoader(template_dir))
        
    def _get_coach_hu_context(self, strictness):
        strictness = int(strictness)
        if strictness <= 3:
            return "慈母模式 (Encouraging)", "Tone should be very encouraging. Focus primarily on what the user did RIGHT. Frame corrections as 'small tips for next time'."
        elif strictness <= 7:
            return "严师模式 (Professional)", "Tone should be professional and objective. Balance praise with necessary corrections. Use data and biomechanics logic."
        elif strictness <= 9:
            return "魔鬼模式 (Ruthless)", "Tone must be extremely critical and perfectionist. Do not use any softening language. Focus purely on errors and efficiency."
        else:
            return "地狱模式 (Nightmare)", "Tone is harsh and unforgiving. Point out every single flaw, no matter how small. Demand perfection."

    def _get_coach_li_context(self, style):
        if style == "aggressive":
            return "搏杀进攻 (Aggressive)", "Suggest aggressive plays. Encourage intercepting at the net, jump smashing, and putting pressure on the opponent. Risk-taking is encouraged."
        else:
            return "稳健控制 (Conservative)", "Suggest safe shots. Prioritize high-clears to baseline, drop shots, and patience. Advise against risky smashes or unforced errors."

    def render_video_analysis(self, strictness=5, style="conservative"):
        mode_label, tone_instruction = self._get_coach_hu_context(strictness)
        style_label, tactical_instruction = self._get_coach_li_context(style)
        
        template = self.env.get_template('video_analysis.jinja2')
        return template.render(
            mode_label=mode_label,
            strictness=strictness,
            tone_instruction=tone_instruction,
            style_label=style_label,
            tactical_instruction=tactical_instruction
        )

    def render_style_analysis(self):
        template = self.env.get_template('style_analysis.jinja2')
        return template.render()

    def render_chat(self, history_context=""):
        template = self.env.get_template('chat.jinja2')
        return template.render(history_context=history_context)
