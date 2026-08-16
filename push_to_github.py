"""
GitHub Push Utility for AI Travel Copilot
==========================================
Usage:
    python push_to_github.py <YOUR_GITHUB_PERSONAL_ACCESS_TOKEN>

Example:
    python push_to_github.py ghp_abcdef1234567890
"""

import sys
import os

try:
    from dulwich import porcelain
    from dulwich.repo import Repo
except ImportError:
    print("Installing required package: dulwich...")
    import subprocess
    subprocess.run([sys.executable, "-m", "pip", "install", "dulwich"])
    from dulwich import porcelain
    from dulwich.repo import Repo

REPO_PATH = os.path.dirname(os.path.abspath(__file__))
REMOTE_BASE = "github.com/DarlaRahul/travel-copilet.git"

def push(token=None):
    if not token and len(sys.argv) > 1:
        token = sys.argv[1]
    
    if not token:
        print("\n" + "=" * 60)
        print("GITHUB TOKEN REQUIRED")
        print("=" * 60)
        print("Please provide your GitHub Personal Access Token (PAT):")
        print("  1. Go to: https://github.com/settings/tokens (Fine-grained or Classic)")
        print("  2. Create a token with 'repo' scope (read/write access)")
        print("  3. Run:\n     python push_to_github.py <YOUR_TOKEN>\n")
        return

    auth_url = f"https://{token.strip()}@{REMOTE_BASE}"
    print(f"Connecting to GitHub: https://{REMOTE_BASE}...")
    
    repo = Repo(REPO_PATH)
    head = repo.head()
    repo.refs[b"refs/heads/main"] = head

    try:
        porcelain.push(repo, auth_url, refspecs=b"refs/heads/main:refs/heads/main")
        print("\n" + "=" * 60)
        print("✅ SUCCESS: All code has been pushed to GitHub!")
        print("🔗 URL: https://github.com/DarlaRahul/travel-copilet")
        print("=" * 60)
    except Exception as e:
        print(f"\n❌ Error during push: {e}")
        print("Please verify that your token has write permissions for the repository.")

if __name__ == "__main__":
    push()
