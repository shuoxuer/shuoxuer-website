import argparse
import json
import os
import sys
from src.engine import PromptEngine

def main():
    parser = argparse.ArgumentParser(description="Badminton Prompts CLI")
    parser.add_argument('--input', required=True, help="Path to input JSON file")
    parser.add_argument('--output', help="Path to output file (optional)")
    
    args = parser.parse_args()
    
    # 1. Read Input
    try:
        with open(args.input, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except Exception as e:
        print(f"Error reading input file: {e}", file=sys.stderr)
        sys.exit(1)
        
    template_name = data.get('template_name')
    params = data.get('parameters', {})
    
    # 2. Generate Prompt
    engine = PromptEngine()
    result = ""
    
    try:
        if template_name == 'video_analysis':
            result = engine.render_video_analysis(
                strictness=params.get('strictness', 5),
                style=params.get('style', 'conservative')
            )
        elif template_name == 'style_analysis':
            result = engine.render_style_analysis()
        elif template_name == 'chat':
            result = engine.render_chat(
                history_context=params.get('history_context', "")
            )
        else:
            print(f"Unknown template_name: {template_name}", file=sys.stderr)
            sys.exit(1)
    except Exception as e:
        print(f"Error generating prompt: {e}", file=sys.stderr)
        sys.exit(1)
        
    # 3. Output
    if args.output:
        try:
            with open(args.output, 'w', encoding='utf-8') as f:
                f.write(result)
            print(f"Successfully wrote to {args.output}")
        except Exception as e:
            print(f"Error writing output file: {e}", file=sys.stderr)
            sys.exit(1)
    else:
        print(result)

if __name__ == "__main__":
    main()