# backend\utils\logger_config.py
import datetime
import logging
import os

from config import LOGS_DIR


def setup_logging():
    root_logger = logging.getLogger()

    if not root_logger.handlers:  # Check if handlers are already added
        # now = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")  # Generate timestamp
        log_file_path = os.path.join(
            LOGS_DIR, f"current_ai_audio_assistant_2024-01-30.log"
        )
        # print("log_file_path: ", log_file_path)

        # Define formatter for the file handler
        file_formatter = logging.Formatter(
            "%(asctime)s | %(levelname)s | %(name)s | %(message)s"
        )

        # File handler - captures all logs
        file_handler = logging.FileHandler(log_file_path)
        file_handler.setFormatter(file_formatter)
        file_handler.setLevel(logging.DEBUG)  # Set to capture debug and above levels

        # **New code to add separate handler for resource_monitor logger**
        resource_monitor_logger = logging.getLogger("resource_monitor")

        # Stop propagation to the root logger
        resource_monitor_logger.propagate = False

        resource_monitor_file_path = os.path.join(
            LOGS_DIR, f"resource_monitor_2024-01-30.log"
        )

        resource_monitor_handler = logging.FileHandler(resource_monitor_file_path)
        resource_monitor_handler.setFormatter(file_formatter)
        resource_monitor_handler.setLevel(logging.DEBUG)  # Adjust log level as needed

        resource_monitor_logger.addHandler(resource_monitor_handler)

        # Set the root logger's level to DEBUG
        root_logger.setLevel(logging.DEBUG)  # Root logger captures all logs
        root_logger.addHandler(file_handler)