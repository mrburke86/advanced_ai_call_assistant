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
        # Load the Whisper model
        whisper_model = whisper.load_model("base")

        # Check if CUDA is available and move the model to GPU if possible
        if torch.cuda.is_available():
            whisper_model = whisper_model.to("cuda")
            logger.info("Loaded Whisper model onto CUDA (GPU).")
        else:
            logger.info("CUDA not available, loaded Whisper model onto CPU.")

        return whisper_model