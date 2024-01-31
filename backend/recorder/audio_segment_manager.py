# recorder\audio_segment_manager.py
import datetime
import logging
import os
import time

import wavio as wv

from config import ORIGINAL_RECORDINGS_DIR, SAMPLE_RATE, SPEECH_BREAK_SECS
from recorder import AudioBuffer

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)


class AudioSegmentManager:
    def __init__(self, transcription_queue):
        self.speech_detected = False
        self.last_speech_time = None
        self.transcription_queue = transcription_queue
        self.audio_buffer = AudioBuffer()
        logger.info("Audio segment manager initialized.")

    def process_audio_chunk(self, original_audio, is_speech_detected):
        try:
            # Speech detected
            if is_speech_detected:
                # First Speech detected
                if not self.speech_detected:
                    logger.info("Speech detected for the first time.")
                    self.speech_detected = True

                self.last_speech_time = time.time()
                self.audio_buffer.append_chunk(original_audio)

            # Speech finished
            elif (
                self.speech_detected
                and (time.time() - self.last_speech_time) > SPEECH_BREAK_SECS
            ):
                self.speech_detected = False
                speech_end_time = datetime.datetime.now()
                buffer_length_seconds = len(self.audio_buffer.buffer) / SAMPLE_RATE
                logger.debug(f"Speech end detected | Time: {speech_end_time}")

                # Save the speech segment to a file
                file_path = self.save_speech_segment()
                if file_path:
                    self.transcription_queue.put(
                        (file_path, speech_end_time, buffer_length_seconds)
                    )
                    logger.info(f"Buffer saved for transcription: {file_path}")
                else:
                    logger.error("Failed to save buffer to file.")

                logger.info(
                    f"Buffer sent for transcription | Buffer Length: {buffer_length_seconds} seconds"
                )

                # Reset the buffer
                self.audio_buffer.reset_buffer()
        except Exception as e:
            logger.error(f"Error during processing buffer: {e}", exc_info=True)

    def save_speech_segment(self):
        filename = self.create_filename()
        wv.write(filename, self.audio_buffer.buffer, SAMPLE_RATE, sampwidth=2)
        return filename

    def create_filename(self):
        return os.path.join(
            ORIGINAL_RECORDINGS_DIR,
            f"{datetime.datetime.now().strftime('%Y-%m-%d_%H-%M-%S')}.wav",
        )