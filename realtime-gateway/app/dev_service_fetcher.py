from app.db import Base,engine,sessionLocal
from app.models import Service  # assuming Service table exists


# Auto create tables
Base.metadata.create_all(bind=engine)

def get_dev_service_ids(dev_id):
    db = sessionLocal()
    try:
        services = db.query(Service).filter_by(owner_id=dev_id).all()
        return [s.service_id for s in services]
    finally:
        db.close()
