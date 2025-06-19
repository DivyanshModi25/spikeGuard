from kafka import KafkaConsumer
import json
import os

def get_consumer():
    KAFKA_BROKER = os.getenv('KAFKA_BROKER')
    return KafkaConsumer(
        "logs",
        bootstrap_servers=[KAFKA_BROKER],
        value_deserializer=lambda m: json.loads(m.decode('utf-8')),
        auto_offset_reset='earliest',
        enable_auto_commit=True,
        group_id='analyzer-service'
    )