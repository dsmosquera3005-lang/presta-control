import requests
import json

SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmY2twa21reGJ1dHZidWtndGNlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTcyNTM3MywiZXhwIjoyMDk1MzAxMzczfQ.o5sfDue8iOs_JWJiksD3Cz-8Vy0jwljky61LLmmFr30"
PROJECT_URL = "https://jfckpkmkxbutvbukgtce.supabase.co"

headers = {
    "Authorization": f"Bearer {SERVICE_KEY}",
    "Content-Type": "application/json",
    "apikey": SERVICE_KEY,
}

payload = {
    "email": "dantiny3005@gmail.com",
    "password": "D@nte3005",
    "email_confirm": True,
    "user_metadata": {
        "full_name": "Administrador",
        "role": "admin"
    }
}

url = f"{PROJECT_URL}/auth/v1/admin/users"
response = requests.post(url, headers=headers, json=payload)

print("Status Code:", response.status_code)
print("Response:", json.dumps(response.json(), indent=2))

if response.status_code == 201:
    print("\n✅ Admin user created successfully!")
    print("Email: dantiny3005@gmail.com")
    print("Password: D@nte3005")
else:
    print("\n❌ Error creating user")
