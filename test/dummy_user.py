import requests
import random
import time
import pytz

# Ingestion API endpoint
INGESTION_URL = "http://65.2.140.214/ingest/ingest"  # replace with actual port if different

# Dummy API key (put valid one here after service creation)
API_KEY = "7fc0207027ff6b95080eb30fcae1da12"

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
        "timestamp":random_timestamp_last_24_hours(),
        "user_ip":random.choice(["8.8.8.8","1.1.1.1","185.53.178.8","133.130.112.12","200.147.67.142","51.140.123.216","142.251.16.100","103.27.9.44","196.41.123.130","62.210.36.44"])
    }

    response = requests.post(INGESTION_URL, json=log_data)
    print(f"Sent log: {log_data} | Response: {response.status_code} - {response.text}")

    # time.sleep(0.5)  # Send a log every 2 seconds
