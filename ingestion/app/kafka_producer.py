from kafka import KafkaProducer
import json
import os

KAFKA_BROKER = os.environ.get("KAFKA_BROKER")

producer = KafkaProducer(
    bootstrap_servers=[KAFKA_BROKER],
    value_serializer=lambda v: json.dumps(v).encode('utf-8')
)

def send_to_kafka(topic, data):
    print("entered")
    producer.send(topic, data)
    producer.flush()
    print(f"Produced message to Kafka topic '{topic}': {data}")