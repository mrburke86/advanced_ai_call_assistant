# recorder\audio_capture_processor.py
import logging
import traceback

import numpy as np
import sounddevice as sd
import webrtcvad

from config import CHUNK_DURATION_SECS, SAMPLE_RATE

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)


class AudioCaptureProcessor:
    def __init__(self):
        self.vad = webrtcvad.Vad(2)
        self.buffer = np.array([], dtype=np.float32)
        logging.debug(
            f"Audio Stream Processor initialized | Sample Rate: {SAMPLE_RATE}, Chunk Duration = {CHUNK_DURATION_SECS} seconds"
        )

    def capture_and_process_stream(self):
        with sd.InputStream(samplerate=SAMPLE_RATE, channels=1) as stream:
            logger.info("Audio stream opened successfully. Recording started.")

            while True:
                try:
                    original_audio, overflowed = stream.read(int(SAMPLE_RATE * CHUNK_DURATION_SECS))
                    # logger.debug("Audio chunk read from stream.")

                    if overflowed:
                        logger.warning("Audio input overflowed. Data may be lost.")

                    converted_data = self.convert_to_pcm(original_audio)
                    # logger.debug("Audio chunk converted to PCM format.")
                    
                    is_speech_detected = self.detect_speech_in_frame(converted_data)
                    # logger.debug(f"Speech detection in frame completed: {'Detected' if is_speech_detected else 'Not detected'}")

                    yield original_audio, is_speech_detected

                except Exception as e:
                    logger.error(f"Error in audio stream processing: {e}")
                    logger.error(traceback.format_exc())  # Detailed stack trace

    def convert_to_pcm(self, original_audio):
        try:
            # logger.debug("Converting audio to PCM format.")
            return (original_audio * 32767).astype(np.int16)
        except Exception as e:
            logger.error(f"Error converting audio to PCM: {e}")
            return np.array([])  # Return an empty array on error

    def detect_speech_in_frame(self, converted_data):
        frame_duration_ms = 30
        frame_size = int(SAMPLE_RATE * frame_duration_ms / 1000)

        is_speech_present = False

        for i in range(0, len(converted_data), frame_size):
            frame = converted_data[i : i + frame_size]
            if len(frame) != frame_size:
                continue

            try:
                flattened_frame = frame.flatten()
                is_speech_present |= self.vad.is_speech(
                    flattened_frame.tobytes(), SAMPLE_RATE
                )
            except Exception as e:  
                logger.error(f"Error while processing frame at position {i}: {e}")
                continue 

        return is_speech_present