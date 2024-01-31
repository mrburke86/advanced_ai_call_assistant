# # transcriber/redis_publisher.py

# import redis
# import logging

# logger = logging.getLogger(__name__)
# logger.setLevel(logging.DEBUG)


# class RedisPublisher:
#     def __init__(self, host="localhost", port=6379, db=0, channel="test_channel"):
#         self.redis_client = redis.Redis(host=host, port=port, db=db)
#         self.channel = channel

#     def publish_message(self, message):
#         self.redis_client.publish(self.channel, message)
#         logger.info(f"Message published to Redis: {message}")