# recorder\audio_segment_manager.py
import datetime
import logging
import os
import time
import traceback  # for detailed error tracing

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
        # logger.debug("Processing audio chunk...")
        try:
            # Speech detected
            if is_speech_detected:
                # First Speech detected
                if not self.speech_detected:
                    logger.info("Speech detected for the first time.")
                    self.speech_detected = True

                self.last_speech_time = time.time()
                self.audio_buffer.append_chunk(original_audio)
                # logger.debug("Appended audio chunk to buffer.")

            # Speech finished
            elif (
                self.speech_detected
                and (time.time() - self.last_speech_time) > SPEECH_BREAK_SECS
            ):
                self.speech_detected = False
                speech_end_time = datetime.datetime.now()
                buffer_length_seconds = len(self.audio_buffer.buffer) / SAMPLE_RATE
                # logger.debug(f"Speech end detected | Time: {speech_end_time}")

                # Save the speech segment to a file
                file_path = self.save_speech_segment()

                # Send Audio Buffer to Transcription Queue
                if file_path:
                    self.transcription_queue.put(
                        (file_path, speech_end_time, buffer_length_seconds)
                    )
                    logger.info(f"Buffer saved to Transcription Queue | File Path: {file_path}")
                else:
                    logger.error("Failed to save buffer to file.")

                logger.info(
                    f"Buffer sent for transcription | Buffer Length: {buffer_length_seconds} seconds"
                )

                # Reset the buffer
                self.audio_buffer.reset_buffer()
                logger.debug("Audio buffer reset after processing.")
        except Exception as e:
            logger.error(f"Error during processing buffer: {e}", exc_info=True)
            logger.error(traceback.format_exc())  # For detailed stack trace

    def save_speech_segment(self):
        try:
            filename = self.create_filename()
            wv.write(filename, self.audio_buffer.buffer, SAMPLE_RATE, sampwidth=2)
            logger.info(f"Audio segment saved: {filename}")
            return filename
        except Exception as e:
            logger.error(f"Error saving audio segment: {e}")
            logger.error(traceback.format_exc())  # For detailed stack trace
            return None

    def create_filename(self):
        filename = os.path.join(ORIGINAL_RECORDINGS_DIR, f"{datetime.datetime.now().strftime('%Y-%m-%d_%H-%M-%S')}.wav")
        logger.debug(f"Created filename for recording: {filename}")
        return filename
