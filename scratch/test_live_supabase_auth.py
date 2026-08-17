import urllib.request
import urllib.error
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

SUPABASE_URL = "https://mciezfmemfsijlqecivi.supabase.co"
SUPABASE_KEY = "sb_publishable_NT07FnLq5vkRaUadkjoVJw_R-rzyenO"

def test_supabase_health():
    print(f"1. Testing Supabase Auth endpoint at {SUPABASE_URL}/auth/v1/health ...")
    req = urllib.request.Request(
        f"{SUPABASE_URL}/auth/v1/health",
        headers={
            "apikey": SUPABASE_KEY,
            "Authorization": f"Bearer {SUPABASE_KEY}"
        }
    )
    try:
        with urllib.request.urlopen(req) as resp:
            data = resp.read().decode('utf-8')
            print(f"   Status: {resp.status}")
            print(f"   Health Response: {data}")
            return True
    except urllib.error.HTTPError as e:
        print(f"   HTTP Error: {e.code} {e.reason}")
        print(f"   Body: {e.read().decode('utf-8')}")
        return False
    except Exception as e:
        print(f"   Error: {e}")
        return False

def test_supabase_anonymous_auth():
    print(f"\n2. Testing Real Supabase Anonymous Authentication (signInAnonymously) ...")
    url = f"{SUPABASE_URL}/auth/v1/signup"
    payload = json.dumps({
        "data": {
            "display_name": "Guest Traveler"
        }
    }).encode('utf-8')
    
    req = urllib.request.Request(
        url,
        data=payload,
        headers={
            "apikey": SUPABASE_KEY,
            "Authorization": f"Bearer {SUPABASE_KEY}",
            "Content-Type": "application/json"
        }
    )
    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            print(f"   Status: {resp.status}")
            print(f"   Created User ID: {data.get('id') or data.get('user', {}).get('id')}")
            print(f"   Is Anonymous: {data.get('is_anonymous') or data.get('user', {}).get('is_anonymous')}")
            print(f"   Has Access Token: {bool(data.get('access_token'))}")
            return True
    except urllib.error.HTTPError as e:
        err_body = e.read().decode('utf-8')
        print(f"   HTTP Error: {e.code} {e.reason}")
        print(f"   Body: {err_body}")
        # Check if anonymous sign-ins are enabled on this Supabase project
        if "anonymous_provider_disabled" in err_body.lower() or "disabled" in err_body.lower():
            print("   -> Note: Anonymous sign-ins need to be enabled in Supabase Dashboard (Authentication -> Providers -> Anonymous)")
        return False
    except Exception as e:
        print(f"   Error: {e}")
        return False

def test_supabase_email_signup():
    print(f"\n3. Testing Real Supabase Email Sign-up ...")
    url = f"{SUPABASE_URL}/auth/v1/signup"
    import uuid
    test_email = f"test_traveler_{uuid.uuid4().hex[:6]}@example.com"
    payload = json.dumps({
        "email": test_email,
        "password": "Password123!",
        "data": {
            "display_name": "Test Voyager"
        }
    }).encode('utf-8')
    
    req = urllib.request.Request(
        url,
        data=payload,
        headers={
            "apikey": SUPABASE_KEY,
            "Authorization": f"Bearer {SUPABASE_KEY}",
            "Content-Type": "application/json"
        }
    )
    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            print(f"   Status: {resp.status}")
            print(f"   Created User Email: {data.get('email') or data.get('user', {}).get('email')}")
            print(f"   Created User ID: {data.get('id') or data.get('user', {}).get('id')}")
            return True
    except urllib.error.HTTPError as e:
        err_body = e.read().decode('utf-8')
        print(f"   HTTP Error: {e.code} {e.reason}")
        print(f"   Body: {err_body}")
        return False
    except Exception as e:
        print(f"   Error: {e}")
        return False

if __name__ == '__main__':
    print("=" * 60)
    print(" LIVE SUPABASE AUTHENTICATION TEST")
    print("=" * 60)
    h_ok = test_supabase_health()
    anon_ok = test_supabase_anonymous_auth()
    signup_ok = test_supabase_email_signup()
    print("\n" + "=" * 60)
    print(f"Health Check     : {'PASS' if h_ok else 'FAIL'}")
    print(f"Anonymous Auth   : {'PASS' if anon_ok else 'FAIL/DISABLED'}")
    print(f"Email Auth/Signup: {'PASS' if signup_ok else 'FAIL'}")
    print("=" * 60)
