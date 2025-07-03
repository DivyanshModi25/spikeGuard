from kafka import KafkaProducer
import json
import os

# KAFKA_BROKER = os.environ.get("KAFKA_BROKER")

# producer = KafkaProducer(
#     bootstrap_servers=[KAFKA_BROKER],
#     value_serializer=lambda v: json.dumps(v).encode('utf-8')
# )

KAFKA_BROKER = os.environ.get("KAFKA_BROKER", "")
BROKER_LIST = KAFKA_BROKER.split(",")

producer = KafkaProducer(
    bootstrap_servers=BROKER_LIST,
    value_serializer=lambda v: json.dumps(v).encode('utf-8')
)
print(BROKER_LIST,producer)

def send_to_kafka(topic, data):
    try:
        print("entered")
        producer.send(topic, data)
        producer.flush()
        print(f"Produced message to Kafka topic '{topic}': {data}")
    except Exception as e:
        print(f"error sending message to kafka {e}")