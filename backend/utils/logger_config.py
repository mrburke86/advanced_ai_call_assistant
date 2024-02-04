# backend\utils\logger_config.py
import datetime
import logging
import os
import multiprocessing

from config import LOGS_DIR


def setup_logging():
    root_logger = logging.getLogger()

    if not root_logger.handlers:
        log_file_path = os.path.join(
            LOGS_DIR, f"current_ai_audio_assistant_2024-02-04.log"
        )

        # Define formatter for the file handler
        file_formatter = logging.Formatter(
            "%(asctime)s | %(levelname)s | %(name)s | %(message)s"
        )

        # File handler - captures all logs
        file_handler = logging.FileHandler(log_file_path)
        file_handler.setFormatter(file_formatter)
        file_handler.setLevel(logging.DEBUG)  # Set to capture debug and above levels

        # Set the root logger's level to DEBUG
        root_logger.setLevel(logging.DEBUG)  # Root logger captures all logs
        root_logger.addHandler(file_handler)

        # Configure multiprocessing logging
        multiprocessing_logger = multiprocessing.get_logger()
        multiprocessing_logger.setLevel(logging.DEBUG)
        multiprocessing_log_handler = logging.StreamHandler()
        multiprocessing_log_handler.setFormatter(file_formatter)
        multiprocessing_logger.addHandler(multiprocessing_log_handler)

        # Set the root logger's level to DEBUG
        root_logger.setLevel(logging.DEBUG)  # Root logger captures all logs
        root_logger.addHandler(file_handler)


setup_logging()
