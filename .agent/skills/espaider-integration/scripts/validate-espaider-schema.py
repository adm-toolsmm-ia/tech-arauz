import json
import sys
import os

def validate_mapping(file_path):
    print(f"🔍 Validating {file_path}...")
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
        errors = []
        
        for entity, fields in data.items():
            print(f"  Checking entity: {entity}")
            if not isinstance(fields, list):
                errors.append(f"Entity '{entity}' must be a list of fields.")
                continue

            for idx, field in enumerate(fields):
                required_keys = ["espaider_field", "db_column", "data_type", "nullable"]
                for key in required_keys:
                    if key not in field:
                        errors.append(f"Entity '{entity}' field #{idx}: Missing required key '{key}'")

        if errors:
            print("❌ Validation Failed:")
            for e in errors:
                print(f"  - {e}")
            sys.exit(1)
            
        print("✅ Validation Passed: Field mapping is structurally correct.")
        
    except FileNotFoundError:
        print(f"❌ Error: File not found at {file_path}")
        sys.exit(1)
    except json.JSONDecodeError as e:
        print(f"❌ Error: Invalid JSON format. {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    current_dir = os.path.dirname(os.path.abspath(__file__))
    # Adjust path to find references/field-mapping.json from scripts/
    mapping_path = os.path.join(current_dir, "../references/field-mapping.json")
    validate_mapping(mapping_path)
