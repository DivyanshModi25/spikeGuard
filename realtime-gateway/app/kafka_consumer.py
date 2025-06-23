from kafka import KafkaConsumer
import json
import os

KAFKA_BROKER=os.getenv('KAFKA_BROKER')
KAFKA_TOPIC="logs"

def create_consumer():
    consumer = KafkaConsumer(
        KAFKA_TOPIC,
        bootstrap_servers=[KAFKA_BROKER],
        auto_offset_reset='latest',
        group_id='realtime-gateway',
        value_deserializer=lambda m: json.loads(m.decode('utf-8'))
    )
    return consumer
