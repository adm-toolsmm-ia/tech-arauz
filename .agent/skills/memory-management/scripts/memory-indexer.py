import os
import re
import glob

MEMORY_DIR = ".agent/memory/"

def get_frontmatter(content):
    match = re.search(r'^---\n(.*?)\n---', content, re.DOTALL)
    if match:
        return match.group(1)
    return ""

def parse_tag(frontmatter):
    match = re.search(r'tags:\s*\[(.*?)\]', frontmatter)
    if match:
        return [t.strip() for t in match.group(1).split(',')]
    return []

def index_memories():
    print("🧠 Indexing Memory Logs...")
    
    files = glob.glob(os.path.join(MEMORY_DIR, "*.md"))
    if not files:
        print("No memory logs found.")
        return

    tag_counts = {}
    total_logs = 0

    for file_path in files:
        if "TEMPLATE.md" in file_path:
            continue
            
        total_logs += 1
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            fm = get_frontmatter(content)
            tags = parse_tag(fm)
            
            for tag in tags:
                tag_counts[tag] = tag_counts.get(tag, 0) + 1

    print(f"\nTotal Logs: {total_logs}")
    print("\nTop Tags:")
    for tag, count in sorted(tag_counts.items(), key=lambda x: x[1], reverse=True)[:5]:
        print(f"- {tag}: {count}")

if __name__ == "__main__":
    if not os.path.exists(MEMORY_DIR):
        print(f"Directory {MEMORY_DIR} does not exist.")
    else:
        index_memories()
