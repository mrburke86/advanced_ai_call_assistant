# main.py

import asyncio
import datetime
import logging
import multiprocessing
import queue
import threading
import time
import signal
from utils.utils import graceful_shutdown
from colorama import Fore, Style, init

from config import ORIGINAL_RECORDINGS_DIR
from recorder import AudioCaptureProcessor, AudioSegmentManager
from transcriber import TranscriberService
from utils import setup_logging

# Initialize colorama
init(autoreset=True)

setup_logging()
logger = logging.getLogger(__name__)

# Set the logging level for the multiprocessing module to INFO to suppress debug messages
logging.getLogger('multiprocessing').setLevel(logging.INFO)


def transcription_worker(transcription_queue, shutdown_event):
    logger.debug("Transcription worker started.")
    try:
        transcriber = TranscriberService()
        transcriber.load_model()
        logger.debug("Transcriber model loaded.")

        while not shutdown_event.is_set():
            try:
                # logger.debug("Waiting for file_path from queue...")
                item = transcription_queue.get(timeout=1)  # Use timeout to periodically check for shutdown
                logger.debug(f"Received file_path from queue: {item}")

                if item is None:
                    logger.debug("Termination signal received. Exiting transcription worker.")
                    break

                file_path, speech_end_timestamp, buffer_length = item
                result = asyncio.run(transcriber.transcribe(file_path, speech_end_timestamp, buffer_length))
                if result:
                    print(Fore.GREEN + f"Transcription Result: {result}")
                    logger.info(f"Transcription Result: {result}")

                else:
                    print(Fore.RED + "Transcription failed or no speech detected.")
                    logger.info("Transcription failed or no speech detected.")

                logger.debug(f"Transcription for {file_path} completed.")
            except queue.Empty:
                # logger.debug("Queue is empty, checking for termination signal...")
                continue
            except KeyboardInterrupt:
                logger.info("KeyboardInterrupt caught in transcription worker.")
                break
    except Exception as e:
        print(Fore.RED + f"Error occurred in transcription worker: {e}")
        logger.error(f"Error occurred in transcription worker: {e}", exc_info=True)
    finally:
        logger.debug("Transcription worker ended.")


def audio_capture_and_processing_wrapper(transcription_queue, shutdown_event):
    logger.debug("Audio capture and processing wrapper started.")
    try:
        audio_capture_processor = AudioCaptureProcessor()
        audio_segment_manager = AudioSegmentManager(transcription_queue)

        for original_audio, is_speech_detected in audio_capture_processor.capture_and_process_stream():
            if shutdown_event.is_set():
                break
            audio_segment_manager.process_audio_chunk(original_audio, is_speech_detected)
    except Exception as e:
        print(Fore.RED + f"Error occurred in audio capture and processing: {e}")
        logger.error(f"Error occurred in audio capture and processing: {e}", exc_info=True)
    finally:
        logger.debug("Audio capture and processing stream has ended.")


if __name__ == "__main__":
    try:
        logger.info("\n\n\n")
        logger.info("Starting main program...")

        transcription_queue = multiprocessing.Queue()
        shutdown_event = multiprocessing.Event()
        processes = []

        audio_thread = threading.Thread(
            target=audio_capture_and_processing_wrapper,
            args=(transcription_queue, shutdown_event),
            daemon=True,
        )
        audio_thread.start()
        logger.info("Audio capture thread started.")

        transcription_worker_process = multiprocessing.Process(
            target=transcription_worker, args=(transcription_queue, shutdown_event)
        )
        transcription_worker_process.start()
        processes.append(transcription_worker_process)
        logger.info("Transcription worker process started.")

        # Use graceful_shutdown from utils.py
        signal.signal(signal.SIGINT, lambda signum, frame: graceful_shutdown(signum, frame, transcription_queue, shutdown_event, processes))

        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        logger.info("KeyboardInterrupt received. Stopping processes.")
        transcription_queue.put(None)
        shutdown_event.set()
        transcription_worker_process.join()
        logger.info("Transcription worker process terminated.")
        audio_thread.join()
        logger.info("Audio thread terminated.")
    except Exception as e:
        print(Fore.RED + f"Unexpected error: {e}")
        logger.error(f"Unexpected error: {e}", exc_info=True)
    finally:
        logger.info("Main application terminated.")
