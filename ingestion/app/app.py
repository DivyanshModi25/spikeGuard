from flask import Flask, request, jsonify
from db import sessionLocal
import models
import kafka_producer
import datetime

app=Flask(__name__)


@app.route("/health")
def health():
    return jsonify({"status": "Ingestion service is healthy"})


@app.route("/ingest",methods=['POST'])
def ingest_log():
    db=sessionLocal()

    try:
        data = request.json 
        required_fields = ['api_key', 'log_level', 'message']

        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Missing field {field}"}), 400
        

        service = db.query(models.Service).filter_by(api_key=data['api_key']).first()
        if not service:
            return jsonify({"error": "Invalid api_key"}), 401
        

        if 'timestamp' not in data:
            data['timestamp'] = datetime.datetime.utcnow().isoformat()
    

        if 'meta' not in data:
            data['meta'] = {
                'dev_ip' : request.headers.get('X-Forwarded-For', request.remote_addr)
            }

        # Send to Kafka
        kafka_producer.send_to_kafka("logs", data)

        return jsonify({"status": "Log accepted"}), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        db.close()


if __name__ == "__main__":
    app.run(host="0.0.0.0", debug=True)