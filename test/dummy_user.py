import requests
import random
import time
import pytz

# Ingestion API endpoint
INGESTION_URL = "http://localhost/ingest/ingest"  # replace with actual port if different

# Dummy API key (put valid one here after service creation)
API_KEY = "bc825bc457ac028e096ca8b8750cff8b"

# Log levels for testing
log_levels = ["INFO", "WARNING", "ERROR", "CRITICAL", "DEBUG"]
# log_levels = ["ERROR"]
import random
from datetime import datetime, timedelta

def random_timestamp_last_24_hours():
    tz = pytz.timezone("Asia/Kolkata")
    now = datetime.now(tz)
    start_time = now - timedelta(hours=24)

    # Get a random number of seconds within the 24-hour window
    random_seconds = random.randint(0, int((now - start_time).total_seconds()))
    
    return now.isoformat()

while True:
    log_data = {
        "api_key": API_KEY,
        "log_level": random.choice(log_levels),
        "message": "This is a test log message.",
        "timestamp":random_timestamp_last_24_hours()
    }

    response = requests.post(INGESTION_URL, json=log_data)
    print(f"Sent log: {log_data} | Response: {response.status_code} - {response.text}")

    # time.sleep(0.5)  # Send a log every 2 seconds
