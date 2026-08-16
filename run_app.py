import subprocess
import sys
import time
import os
import signal

def run():
    print("=" * 65)
    print("      🚀 Starting AI Travel Copilot Full-Stack Application      ")
    print("=" * 65)
    print("Backend API will start at:  http://localhost:8000")
    print("Backend API Docs at:        http://localhost:8000/docs")
    print("Frontend App will start at: http://localhost:5173")
    print("=" * 65)

    backend_proc = subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"],
        cwd=os.path.abspath(".")
    )

    frontend_proc = subprocess.Popen(
        "npm run dev",
        shell=True,
        cwd=os.path.abspath("frontend")
    )

    print("\nPress Ctrl+C to terminate both servers.\n")

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\nShutting down servers...")
        backend_proc.terminate()
        frontend_proc.terminate()
        sys.exit(0)

if __name__ == "__main__":
    run()
