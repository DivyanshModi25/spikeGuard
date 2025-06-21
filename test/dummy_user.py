import requests
import random
import time

# Ingestion API endpoint
INGESTION_URL = "http://localhost/ingest/ingest"  # replace with actual port if different

# Dummy API key (put valid one here after service creation)
API_KEY = "d3f4ee3c4ee32744a756ad7b273d705f"

# Log levels for testing
log_levels = ["INFO", "WARNING", "ERROR", "CRITICAL", "DEBUG"]
# log_levels = ["ERROR"]

while True:
    log_data = {
        "service_api_key": API_KEY,
        "log_level": random.choice(log_levels),
        "message": "This is a test log message."
    }

    response = requests.post(INGESTION_URL, json=log_data)
    print(f"Sent log: {log_data} | Response: {response.status_code} - {response.text}")

    time.sleep(2)  # Send a log every 2 seconds
