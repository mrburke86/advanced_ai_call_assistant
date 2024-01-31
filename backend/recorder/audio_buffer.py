# recorder\audio_buffer.py
import logging

import numpy as np

from config import BUFFER_DURATION_SECS, SAMPLE_RATE

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)


class AudioBuffer:
    def __init__(self):
        self.buffer = np.array([], dtype=np.float32)
        logger.debug(
            f"AudioBuffer initialized with buffer duration: {BUFFER_DURATION_SECS} secs, sample rate: {SAMPLE_RATE}"
        )

    def append_chunk(self, new_chunk):
        new_chunk_mono = new_chunk[:, 0] if len(new_chunk.shape) == 2 else new_chunk
        # logger.debug(
        #     f"Adding chunk of shape {new_chunk.shape} to buffer of shape {self.buffer.shape}"
        # )
        self.buffer = np.concatenate((self.buffer, new_chunk_mono))
        # logger.debug(f"Chunk added to Buffer")
        self.trim_buffer()

    def trim_buffer(self):
        max_length = int(BUFFER_DURATION_SECS * SAMPLE_RATE)
        # logger.debug(f"Checking buffer length against maximum: {max_length}")

        if len(self.buffer) > max_length:
            self.buffer = self.buffer[-max_length:]
            logger.debug(f"Buffer trimmed to maximum length: {max_length}")
        else:
            pass
            # logger.debug(f"Buffer not yet beyond maximum length: {max_length}")

    def reset_buffer(self):
        logger.debug("Clearing audio buffer")
        self.buffer = np.array([], dtype=np.float32)