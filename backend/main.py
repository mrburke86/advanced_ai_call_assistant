# main.py

import asyncio
import datetime
import logging
import multiprocessing
import threading
import time
import signal
from utils.utils import signal_handling

from config import ORIGINAL_RECORDINGS_DIR
from recorder import AudioCaptureProcessor, AudioSegmentManager
from transcriber import TranscriberService
from utils import setup_logging

setup_logging()
logger = logging.getLogger(__name__)


async def transcription_worker(transcription_queue):
    logger.debug("Transcription worker started.")
    try:
        transcriber = TranscriberService()
        transcriber.load_model()
        logger.debug("Transcriber model loaded.")

        while True:
            try:
                logger.debug("Waiting for file_path from queue...")
                item = transcription_queue.get()
                logger.debug(f"Received file_path from queue: {item}")

                if item is None:
                    # file_path = transcription_queue.get()
                    # if file_path is None:
                    logger.debug(
                        "Termination signal received. Exiting transcription worker."
                    )
                    break

                # Create dummy "end_time" and "buffer_length"
                # end_time = datetime.datetime.now()
                # buffer_length = 12.7

                # logger.debug(f"Transcription for {file_path} started.")

                file_path, speech_end_timestamp, speech_end_clock, buffer_length = item
                await transcriber.transcribe(
                    file_path, speech_end_timestamp, speech_end_clock, buffer_length
                )
                logger.debug(f"Transcription for {file_path} completed.")
            except transcription_queue.Empty:
                logger.debug("Queue is empty, checking for termination signal...")
                continue  # or break, depending on your termination logic

    except Exception as e:
        logger.error(f"Error occurred in transcription worker: {e}", exc_info=True)


def worker_main(transcription_queue):
    logger.debug("Worker main function started.")
    try:
        asyncio.run(transcription_worker(transcription_queue))
    except Exception as e:
        logger.error(f"Error occurred in transcription worker: {e}", exc_info=True)
    finally:
        logger.debug("Worker main function ended.")


def audio_capture_and_processing_wrapper(transcription_queue):
    logger.debug("Audio capture and processing wrapper started.")
    try:
        audio_capture_processor = AudioCaptureProcessor()
        audio_segment_manager = AudioSegmentManager(transcription_queue)

        for (
            original_audio,
            is_speech_detected,
        ) in audio_capture_processor.capture_and_process_stream():
            # logger.debug("Processing audio chunk.")
            audio_segment_manager.process_audio_chunk(
                original_audio, is_speech_detected
            )
    except Exception as e:
        logger.error(
            f"Error occurred in audio capture and processing: {e}", exc_info=True
        )
    finally:
        logger.debug("Audio capture and processing stream has ended.")


if __name__ == "__main__":
    try:
        logger.info("\n\n\n")
        logger.info("Starting main program...")
        signal.signal(signal.SIGINT, signal_handling)
        transcription_queue = multiprocessing.Queue()

        audio_thread = threading.Thread(
            target=audio_capture_and_processing_wrapper,
            args=(transcription_queue,),
            daemon=True,
        )
        audio_thread.start()
        logger.info("Audio capture thread started.")

        transcription_worker_process = multiprocessing.Process(
            target=worker_main, args=(transcription_queue,)
        )
        transcription_worker_process.start()
        logger.info("Transcription worker process started.")

        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        logger.info("KeyboardInterrupt received. Stopping processes.")
        transcription_queue.put(None)
        logger.info("Termination signal sent to transcription worker.")
        # transcription_worker_process.join()
        # logger.info("Transcription worker process terminated.")
        # audio_thread.join()
    except Exception as e:
        logger.error(f"Unexpected error: {e}", exc_info=True)
    finally:
        logger.info("Main application terminated.")
