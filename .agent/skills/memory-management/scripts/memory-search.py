import os
import sys
import glob

MEMORY_DIR = ".agent/memory/"

def search_memory(query):
    print(f"🔍 Searching memories for: '{query}'...")
    
    files = glob.glob(os.path.join(MEMORY_DIR, "*.md"))
    results = []

    for file_path in files:
        if "TEMPLATE.md" in file_path:
            continue
            
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            if query.lower() in content.lower():
                results.append(os.path.basename(file_path))

    if results:
        print(f"\nFound {len(results)} matches:")
        for r in results:
            print(f"- {r}")
    else:
        print("\nNo matches found.")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python memory-search.py <query>")
        sys.exit(1)
    
    search_memory(sys.argv[1])
