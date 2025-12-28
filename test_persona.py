import requests
import json

url = "http://localhost:3001/api/search/persona"
payload = {
    "role": "SaaS Founder",
    "location": "Austin"
}
headers = {
    "Content-Type": "application/json"
}

try:
    print(f"Sending POST request to {url}...")
    response = requests.post(url, json=payload, headers=headers)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
