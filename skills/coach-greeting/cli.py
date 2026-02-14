import argparse
import sys
from src.engine import GreetingEngine

def main():
    parser = argparse.ArgumentParser(description="Coach Greeting CLI")
    parser.add_argument('--output', help="Path to output file (optional)")
    
    args = parser.parse_args()
    
    engine = GreetingEngine()
    try:
        greeting = engine.generate_greeting()
    except Exception as e:
        print(f"Error generating greeting: {e}", file=sys.stderr)
        sys.exit(1)
        
    if args.output:
        try:
            with open(args.output, 'w', encoding='utf-8') as f:
                f.write(greeting)
            print(f"Successfully wrote to {args.output}")
        except Exception as e:
            print(f"Error writing output file: {e}", file=sys.stderr)
            sys.exit(1)
    else:
        print(greeting)

if __name__ == "__main__":
    main()