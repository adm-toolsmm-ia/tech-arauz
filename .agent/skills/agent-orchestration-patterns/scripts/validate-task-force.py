import re
import sys
import os

def validate_task_force(file_path):
    print(f"🕵️ Validating Task Force Plan: {file_path}")
    
    if not os.path.exists(file_path):
        print("❌ File not found.")
        return

    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    errors = []
    warnings = []

    # Check for Pattern definition
    if not re.search(r'\*\*Pattern:\*\*', content):
        errors.append("Missing '**Pattern:**' definition (Pair/Trio/Squad).")

    # Check for Agents (P0, P1, etc.)
    if not re.search(r'\*\*P0:\*\*', content):
        errors.append("Missing '**P0:**' role assignment.")

    # Check for Success Criteria
    if not re.search(r'## ✅ Success Criteria', content):
        errors.append("Missing '## ✅ Success Criteria' section.")
    elif not re.search(r'- \[ \]', content):
        warnings.append("Success criteria checklist seems empty.")

    print("\nReport:")
    if errors:
        print("❌ VALIDATION FAILED")
        for e in errors:
            print(f"  - {e}")
        sys.exit(1)
    else:
        print("✅ STRUCTURE VALID")
        if warnings:
            for w in warnings:
                print(f"  ⚠️ {w}")
        sys.exit(0)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python validate-task-force.py <file_path>")
        sys.exit(1)
    validate_task_force(sys.argv[1])
