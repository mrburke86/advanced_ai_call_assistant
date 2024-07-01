# backend\utils\logger_config.py
import datetime
import logging
import os
import multiprocessing

# from config import LOGS_DIR


# def setup_logging():
#     root_logger = logging.getLogger()

#     if not root_logger.handlers:
#         # Generate today's log file name
#         today = datetime.date.today()
#         log_file_name = f"current_ai_audio_assistant_{today.strftime('%Y-%m-%d')}.log"
#         log_file_path = os.path.join(LOGS_DIR, log_file_name)

#         # Create the logs directory if it doesn't exist
#         os.makedirs(LOGS_DIR, exist_ok=True)

#         # Define formatter for the file handler
#         file_formatter = logging.Formatter(
#             "%(asctime)s | %(levelname)s | %(name)s | %(message)s"
#         )

#         # File handler - captures all logs
#         file_handler = logging.FileHandler(log_file_path)
#         file_handler.setFormatter(file_formatter)
#         file_handler.setLevel(logging.DEBUG)  # Set to capture debug and above levels

#         # Set the root logger's level to DEBUG
#         root_logger.setLevel(logging.DEBUG)  # Root logger captures all logs
#         root_logger.addHandler(file_handler)

#         # Configure multiprocessing logging
#         multiprocessing_logger = multiprocessing.get_logger()
#         multiprocessing_logger.setLevel(logging.DEBUG)
#         multiprocessing_log_handler = logging.StreamHandler()
#         multiprocessing_log_handler.setFormatter(file_formatter)
#         multiprocessing_logger.addHandler(multiprocessing_log_handler)

#         # Set the root logger's level to DEBUG
#         root_logger.setLevel(logging.DEBUG)  # Root logger captures all logs
#         root_logger.addHandler(file_handler)


# setup_logging()

from config import LOGS_DIR

#
#
# Trying to centralize logging
#
#

# Path to the centralized logs directory
LOGS_DIR = os.path.join(os.path.dirname(__file__), '..', '..', 'logs')


def setup_logging():
    root_logger = logging.getLogger()

    if not root_logger.handlers:
        # Generate today's log file name
        today = datetime.date.today()
        log_file_name = f"current_ai_audio_assistant_{today.strftime('%Y-%m-%d')}.log"
        log_file_path = os.path.join(LOGS_DIR, log_file_name)

        # Create the logs directory if it doesn't exist
        os.makedirs(LOGS_DIR, exist_ok=True)

        # Define formatter for the file handler
        file_formatter = logging.Formatter(
            "%(asctime)s | %(levelname)s | %(name)s | %(message)s"
        )

        # File handler - captures all logs
        file_handler = logging.FileHandler(log_file_path)
        file_handler.setFormatter(file_formatter)
        file_handler.setLevel(logging.DEBUG)  # Set to capture debug and above levels

        # Console handler - captures all logs
        console_handler = logging.StreamHandler()
        console_handler.setFormatter(file_formatter)
        console_handler.setLevel(logging.DEBUG)  # Set to capture debug and above levels

        # Set the root logger's level to DEBUG
        root_logger.setLevel(logging.DEBUG)  # Root logger captures all logs
        root_logger.addHandler(file_handler)
        root_logger.addHandler(console_handler)

        # Configure multiprocessing logging
        multiprocessing_logger = multiprocessing.get_logger()
        multiprocessing_logger.setLevel(logging.DEBUG)
        multiprocessing_log_handler = logging.StreamHandler()
        multiprocessing_log_handler.setFormatter(file_formatter)
        multiprocessing_logger.addHandler(multiprocessing_log_handler)

        # Set the root logger's level to DEBUG
        root_logger.setLevel(logging.DEBUG)  # Root logger captures all logs
        root_logger.addHandler(file_handler)
        root_logger.addHandler(console_handler)

# Initialize the logging setup
setup_logging()
