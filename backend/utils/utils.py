# backend\utils\utils.py
import datetime
import logging
import os
import shutil
import signal
import sys
import time

logger = logging.getLogger(__name__)


# Create Friendly Time and Date
def create_friendly_time(timestamp, format_option="default"):
    """
    Creates a human-readable time string from a Unix timestamp with microsecond precision.

    Args:
        timestamp (float): The Unix timestamp in seconds.
        format_option (str): The desired format for the output string.
            Available options:
                - "default": YYYY-MM-DD HH:MM:SS.SSS (e.g., "2024-01-21 07:45:00.125")
                - "date-only": YYYY-MM-DD (e.g., "2024-01-21")
                - "time-only": HH:MM:SS.SSS (e.g., "07:45:00.125")
                - "full-weekday": Weekday, Month Day, Year (e.g., "Sunday, January 21, 2024")

    Returns:
        str: The formatted time string.
    """

    dt = datetime.datetime.fromtimestamp(timestamp, datetime.timezone.utc)

    if format_option == "default":
        return dt.strftime("%Y-%m-%d %H:%M:%S.%f")[:-3]  # Truncate to 3 decimal places
    elif format_option == "date-only":
        return dt.strftime("%Y-%m-%d")
    elif format_option == "time-only":
        return dt.strftime("%H:%M:%S.%f")[:-3]  # Truncate to 3 decimal places
    elif format_option == "full-weekday":
        return dt.strftime("%A, %B %d, %Y")
    else:
        raise ValueError(f"Invalid format option: {format_option}")


# Shutdown Workers
def shutdown_workers(workers, transcription_queue, num_workers):
    # Send shutdown signal to each worker
    logger.debug("Sending termination signal to transcription workers.")
    for _ in range(num_workers):
        transcription_queue.put(None)

    # Wait for each worker to complete
    logger.debug("Waiting for transcription workers to complete...")
    for worker in workers:
        worker.join()
        logger.debug(f"Worker {worker.name} has been successfully shut down.")


# Shutdown Audio Capture Thread
def shutdown_thread(audio_thread, ws_thread):
    # Stop the audio capture thread if it's still running
    if audio_thread.is_alive():
        logger.debug("Stopping the audio capture thread...")
        audio_thread.join()
        logger.debug("Audio capture thread has been successfully shut down.")
    if ws_thread.is_alive():
        logger.debug("Stopping the websocket thread...")
        ws_thread.join()
        logger.debug("Websocket thread has been successfully shut down.")


# Remove Pycache
def remove_pycache(root_dir):
    """
    Recursively removes __pycache__ directories from the specified root directory.
    """
    logger = logging.getLogger(__name__)
    pycache_found = False

    for dirpath, dirnames, filenames in os.walk(root_dir):
        if "__pycache__" in dirnames:
            pycache_path = os.path.join(dirpath, "__pycache__")
            # shutil.rmtree(pycache_path)
            # logger.info(f"Removed __pycache__ directory: {pycache_path}")
            pycache_found = True

    if not pycache_found:
        logger.info("No __pycache__ directories found to remove.")


# Signal Handling
def signal_handling(signum, frame):
    logger.info("Signal received. Initiating shutdown sequence...")
    raise KeyboardInterrupt


# Setup and Start Recording Environment
def setup_recording_environment(directory):
    signal.signal(signal.SIGINT, signal_handling)
    logger.info("\n\n\nStarting main program...")

    logger.debug(f"Beginning to clear recordings from directory: {directory}")
    file_count = 0
    for filename in os.listdir(directory):
        file_path = os.path.join(directory, filename)
        logger.debug(f"Processing file: {file_path}")
        try:
            if os.path.isfile(file_path) or os.path.islink(file_path):
                os.unlink(file_path)
                file_count += 1
                logger.debug(f"Deleted file: {file_path}")
            elif os.path.isdir(file_path):
                shutil.rmtree(file_path)
                logger.debug(f"Deleted directory: {file_path}")
        except Exception as e:
            logger.exception(f"Failed to delete {file_path}. Reason: {e}")

    # Log appropriate message based on file count
    if file_count == 0:
        logger.info(f"There were no files to delete from '{directory}' directory.")
    else:
        logger.info(f"Finished clearing recordings. {file_count} files deleted.")