import urllib.request
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

session_id = "test-session-copilot"
tests = [
    "I live in Hyderabad and want to explore Hyderabad for 5 days.",
    "I live in Hyderabad and want to explore Hyderabad for 5 days. I like food and history and my budget is ₹20,000.",
    "Add Charminar to day 2.",
    "Make day 3 more relaxed.",
    "Find hotels in Hyderabad for ₹5,000 per night.",
    "Find flights from Hyderabad to Dubai.",
    "Hyderabad lo 5 rojulu trip plan cheyyi, food and history kavali.",
    "मुझे हैदराबाद में 3 दिन घूमना है, खाने और इतिहास में रुचि है।",
    "Plan a trip to Tokyo.",
    "अब हिंदी में जवाब दो।",
    "Now tell me the same thing in Japanese."
]

for idx, t in enumerate(tests, 1):
    try:
        req = urllib.request.Request(
            "http://127.0.0.1:8000/api/chat",
            data=json.dumps({"message": t, "session_id": session_id}).encode("utf-8"),
            headers={"Content-Type": "application/json"}
        )
        res = json.loads(urllib.request.urlopen(req).read())
        print(f"=== TEST {idx}: '{t}' ===")
        print(f"Embedded Type: {res.get('embedded_type')}")
        print(f"Content:\n{res.get('content')}")
        print("-" * 60)
    except Exception as e:
        print(f"Error on Test {idx}: {e}")
