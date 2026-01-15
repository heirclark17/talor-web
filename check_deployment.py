#!/usr/bin/env python3
"""
Check if frontend deployment is complete
"""
import requests
import time

FRONTEND_URL = "https://talorme.com"

def check_deployment():
    print("=" * 70)
    print("CHECKING FRONTEND DEPLOYMENT STATUS")
    print("=" * 70)

    print("\nFetching frontend HTML...")
    try:
        response = requests.get(FRONTEND_URL, timeout=10)
        html = response.text

        # Check for signs of the new code
        if 'talor_user_id' in html or 'userSession' in html:
            print("SUCCESS: New code detected in HTML!")
            return True

        # Check the JavaScript bundles
        print("\nChecking JavaScript bundles...")
        # Look for script tags
        import re
        script_urls = re.findall(r'<script[^>]+src="([^"]+)"', html)

        print(f"Found {len(script_urls)} script tags")

        for i, script_url in enumerate(script_urls[:5], 1):  # Check first 5 scripts
            if not script_url.startswith('http'):
                if script_url.startswith('//'):
                    script_url = 'https:' + script_url
                elif script_url.startswith('/'):
                    script_url = FRONTEND_URL + script_url
                else:
                    script_url = FRONTEND_URL + '/' + script_url

            print(f"\n  Script {i}: {script_url[:80]}...")

            try:
                js_response = requests.get(script_url, timeout=10)
                js_code = js_response.text

                if 'talor_user_id' in js_code:
                    print("    SUCCESS: Found 'talor_user_id' in JavaScript!")
                    return True
                elif 'userSession' in js_code:
                    print("    SUCCESS: Found 'userSession' in JavaScript!")
                    return True
                elif 'X-User-ID' in js_code:
                    print("    SUCCESS: Found 'X-User-ID' header in JavaScript!")
                    return True
                else:
                    print("    No new code detected in this bundle")

            except Exception as e:
                print(f"    ERROR fetching script: {e}")

        print("\n" + "=" * 70)
        print("DEPLOYMENT STATUS: NOT YET DEPLOYED")
        print("=" * 70)
        print("\nThe new frontend code has not been deployed yet.")
        print("Vercel is likely still building or queued.")
        print("\nYou can check deployment status at:")
        print("https://vercel.com/dashboard")
        return False

    except Exception as e:
        print(f"\nERROR: {e}")
        return False

def wait_for_deployment(max_wait=300):
    print("\n" + "=" * 70)
    print("WAITING FOR DEPLOYMENT")
    print("=" * 70)
    print(f"\nWill check every 30 seconds for up to {max_wait//60} minutes...")

    start_time = time.time()

    while time.time() - start_time < max_wait:
        elapsed = int(time.time() - start_time)
        print(f"\n[{elapsed}s] Checking deployment...")

        if check_deployment():
            print("\n" + "=" * 70)
            print("DEPLOYMENT COMPLETE!")
            print("=" * 70)
            return True

        if time.time() - start_time < max_wait:
            print("\nWaiting 30 seconds before next check...")
            time.sleep(30)

    print("\n" + "=" * 70)
    print("TIMEOUT")
    print("=" * 70)
    print(f"\nDeployment not detected after {max_wait//60} minutes.")
    print("Please check Vercel dashboard manually.")
    return False

if __name__ == "__main__":
    # Check once
    if not check_deployment():
        # If not deployed, wait and monitor
        response = input("\nWait for deployment? (yes/no): ")
        if response.lower() == 'yes':
            wait_for_deployment()
