# main.py

import asyncio
import logging
import multiprocessing
import threading
import time
import queue

from config import ORIGINAL_RECORDINGS_DIR
from recorder import AudioCaptureProcessor, AudioSegmentManager
from transcriber import TranscriberService
from utils import (
    setup_logging,
    setup_recording_environment,
)

setup_logging()
logger = logging.getLogger(__name__)


async def transcription_worker(transcription_queue):
    try:
        transcriber = TranscriberService()
        transcriber.load_model()

        while True:
            item = transcription_queue.get()
            if item is None:
                logger.debug(
                    "Termination signal received. Exiting transcription worker."
                )
                break

            file_path, end_time, buffer_length = item
            await transcriber.transcribe(file_path, end_time, buffer_length)
    except Exception as e:
        logger.error(f"Error occurred in transcription worker: {e}", exc_info=True)


def worker_main(transcription_queue):
    try:
        asyncio.run(transcription_worker(transcription_queue))
    except Exception as e:
        logger.error(f"Error occurred in transcription worker: {e}", exc_info=True)


def audio_capture_and_processing_wrapper(transcription_queue):
    try:
        audio_capture_processor = AudioCaptureProcessor()
        audio_segment_manager = AudioSegmentManager(transcription_queue)

        for (
            original_audio,
            is_speech_detected,
        ) in audio_capture_processor.capture_and_process_stream():
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
        setup_recording_environment(ORIGINAL_RECORDINGS_DIR)
        transcription_queue = multiprocessing.Queue()
        # transcription_queue = queue.Queue()

        audio_thread = threading.Thread(
            target=audio_capture_and_processing_wrapper,
            args=(transcription_queue,),
            daemon=True,
        )
        audio_thread.start()

        transcription_worker_process = multiprocessing.Process(
            target=worker_main, args=(transcription_queue,)
        )
        transcription_worker_process.start()

        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        transcription_queue.put(None)
        transcription_worker_process.join()
        audio_thread.join()
    except Exception as e:
        logger.error(f"Unexpected error: {e}", exc_info=True)