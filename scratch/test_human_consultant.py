import urllib.request
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

def chat(session_id: str, message: str) -> dict:
    req = urllib.request.Request(
        "http://127.0.0.1:8000/api/chat",
        data=json.dumps({"message": message, "session_id": session_id}).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )
    return json.loads(urllib.request.urlopen(req).read())

def run_dialogue(title: str, session_id: str, turns: list):
    print(f"\n========================================================")
    print(f"  {title}")
    print(f"========================================================")
    for idx, user_msg in enumerate(turns, 1):
        print(f"\n[Turn {idx}] USER: {user_msg}")
        res = chat(session_id, user_msg)
        print(f"[Turn {idx}] ASSISTANT (Feasibility: {res.get('feasibility_status')} | Type: {res.get('embedded_type')}):")
        print(res.get('content'))
        if res.get('action_buttons'):
            btn_labels = [b['label'] for b in res['action_buttons']]
            print(f"  --> Action Buttons: {btn_labels}")

if __name__ == "__main__":
    # Test 1: Step-by-step Clarification + Feasibility on Unrealistic Budget + Budget Correction
    run_dialogue(
        "ACCEPTANCE TEST 1: Step-by-Step Clarification + Realistic Feasibility (Paris)",
        "session-test-1",
        [
        "I want to go to Paris.",
        "Hyderabad.",
        "5 days.",
        "2 adults.",
        "₹20,000.",
        "Okay, make the budget ₹1,50,000.",
        "Balanced, mid-range hotel."
    ]
)

# Test 2: Local Trip Recognition (Hyderabad)
run_dialogue(
    "ACCEPTANCE TEST 2: Local Trip Recognition (Hyderabad)",
    "session-test-2",
    [
        "I live in Hyderabad and want to explore Hyderabad for 5 days.",
        "₹20,000.",
        "Food and history, balanced."
    ]
)

# Test 3: Dubai 4 Days with Budget Feasibility
run_dialogue(
    "ACCEPTANCE TEST 3: Dubai 4-Day Trip Reasoning",
    "session-test-3",
    [
        "I want to go to Dubai.",
        "Hyderabad.",
        "4.",
        "2.",
        "₹60,000.",
        "Comfortable hotel."
    ]
)

# Test 4: All-in-one Input Comprehension
run_dialogue(
    "ACCEPTANCE TEST 4: All-in-One Input Comprehension",
    "session-test-4",
    [
        "I want to travel from Hyderabad to Dubai for 4 days with my wife. Budget is ₹60,000 and I want a comfortable hotel."
    ]
)

# Test 5: Casual Language Reasoning
run_dialogue(
    "ACCEPTANCE TEST 5: Casual Language Feasibility Reasoning",
    "session-test-5",
    [
        "Bro I want to go Paris from Hyderabad for 5 days, two people. Budget is 50k. Is it doable?"
    ]
)
