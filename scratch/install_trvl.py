import os
import sys
import tarfile
import urllib.request
from pathlib import Path

sys.stdout.reconfigure(encoding='utf-8')

PROJECT_ROOT = Path(__file__).resolve().parent.parent
BIN_DIR = PROJECT_ROOT / "bin"
BIN_DIR.mkdir(exist_ok=True)

TRVL_TAR_URL = "https://github.com/MikkoParkkola/trvl/releases/download/v1.21.4/trvl_1.21.4_windows_amd64.tar.gz"
TAR_PATH = BIN_DIR / "trvl.tar.gz"
EXE_PATH = BIN_DIR / "trvl.exe"

def download_and_extract():
    if EXE_PATH.exists():
        print(f"trvl executable already exists at {EXE_PATH}")
        return True
        
    print(f"Downloading {TRVL_TAR_URL} ...")
    urllib.request.urlretrieve(TRVL_TAR_URL, TAR_PATH)
    print(f"Downloaded to {TAR_PATH} (size: {TAR_PATH.stat().st_size} bytes)")
    
    print("Extracting archive...")
    with tarfile.open(TAR_PATH, "r:gz") as tar:
        tar.extractall(path=BIN_DIR)
    
    if TAR_PATH.exists():
        TAR_PATH.unlink()
        
    if EXE_PATH.exists():
        print(f"SUCCESS: trvl installed at {EXE_PATH}")
        return True
    else:
        print(f"ERROR: trvl.exe not found after extraction. Files in bin/: {list(BIN_DIR.iterdir())}")
        return False

if __name__ == "__main__":
    download_and_extract()
