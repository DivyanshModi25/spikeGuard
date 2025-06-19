from kafka import KafkaConsumer
import json

# Kafka broker address (depends on docker-compose network)
KAFKA_BROKER = "host.docker.internal:9092"  # or your internal docker network if required
TOPIC_NAME = "logs"

consumer = KafkaConsumer(
    TOPIC_NAME,
    bootstrap_servers=[KAFKA_BROKER],
    value_deserializer=lambda m: json.loads(m.decode('utf-8')),
    auto_offset_reset='earliest',
    enable_auto_commit=True,
    group_id='test-consumer-group'
)

print("Starting Kafka consumer...")

for message in consumer:
    log_entry = message.value
    print(f"Received log from Kafka: {log_entry}")
