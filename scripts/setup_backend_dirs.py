import os

dirs = [
    "backend/app/models",
    "backend/app/schemas",
    "backend/app/ml",
    "backend/app/optimization",
    "backend/app/rag",
    "backend/app/agents",
    "backend/app/api"
]

for d in dirs:
    os.makedirs(d, exist_ok=True)
    init_file = os.path.join(d, "__init__.py")
    if not os.path.exists(init_file):
        with open(init_file, "w") as f:
            f.write("# Module init\n")

print("Backend directories created successfully.")
