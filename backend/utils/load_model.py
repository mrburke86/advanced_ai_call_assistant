# backend\utils\load_model.py 
import logging

import torch
import whisper

from config import MODEL_NAME

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)


class WhisperModelLoader:

    @classmethod
    def load_model(cls, model_name):
        logger.debug(f"Attempting to load the Whisper model: {model_name}")

        try:
            # Load the Whisper model
            whisper_model = whisper.load_model(model_name)
            logger.info(f"Whisper model {model_name} loaded successfully.")

            # Check if CUDA is available and move the model to GPU if possible
            if torch.cuda.is_available():
                whisper_model = whisper_model.to("cuda")
                logger.info("Loaded Whisper model onto CUDA (GPU).")
            else:
                logger.info("CUDA not available, loaded Whisper model onto CPU.")

            return whisper_model

        except Exception as e:
            logger.error(f"Error occurred while loading Whisper model: {e}")
            logger.debug("Exception details:", exc_info=True)
            return None
