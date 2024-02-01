# transcriber\transcriber_service.py

import datetime
import json
import logging
import requests

import torch
import whisper

# from transcriber.redis_publisher import RedisPublisher
from config import MODEL_NAME
from utils.load_model import WhisperModelLoader

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)


class TranscriberService:
    def __init__(self):
        self.whisper_model = None
        # self.redis_publisher = RedisPublisher()

    def send_data_to_nextjs(self, data):
        try:
            url = "http://localhost:3000/api/receive-data"  # Update with your Next.js API route
            response = requests.post(url, json=data)
            logger.info(
                f"Data sent to Next.js | Status Code: {response.status_code} | Response: {response.json()}"
            )
            return response.status_code, response.json()
        except Exception as e:
            logger.error(f"Error sending data to Next.js: {e}", exc_info=True)
            return None

    def load_model(self):
        self.whisper_model = WhisperModelLoader.load_model(MODEL_NAME)

    def process_audio_file(self, file_path):
        try:
            audio = whisper.load_audio(file_path)
            audio = whisper.pad_or_trim(audio)
            audio_tensor = torch.from_numpy(audio).to(self.whisper_model.device)
            mel = whisper.log_mel_spectrogram(audio_tensor).to(
                self.whisper_model.device
            )
            return mel
        except Exception as e:
            logger.error(f"Error while processing audio file: {e}", exc_info=True)
            return None

    async def transcribe(self, file_path, speech_end_time, buffer_length):
        try:
            mel = self.process_audio_file(file_path)
            if mel is None:
                return None

            options = whisper.DecodingOptions(language="en", fp16=False)
            result = whisper.decode(self.whisper_model, mel, options)
            transcription_end_time = datetime.datetime.now()
            logger.debug(f"Transcription Complete | Time: {transcription_end_time}")

            # Calculate and log the transcription time
            time_difference = transcription_end_time - speech_end_time
            logger.info(f"Speech End Time: {speech_end_time}")
            time_in_seconds = time_difference.total_seconds()
            formatted_time = "{:.2f}".format(time_in_seconds)
            logger.info(f"Transcription time: {formatted_time} seconds")

            if result and result.no_speech_prob < 0.5:
                logger.info(f"Transcription: {result.text}")

                # Create a data dictionary
                data = {
                    "current_timestamp": datetime.datetime.now().strftime(
                        "%Y-%m-%d | %H:%M:%S.%f"
                    )[:-3],
                    "speech_end_time": speech_end_time.strftime(
                        "%Y-%m-%d | %H:%M:%S.%f"
                    )[:-3],
                    "transcription_end_time": transcription_end_time.strftime(
                        "%Y-%m-%d | %H:%M:%S.%f"
                    )[:-3],
                    "transcription_time": f"{formatted_time} seconds",
                    "speech_length": f"{buffer_length} seconds",
                    "transcription": result.text,
                }

                # Send the data to Next.js
                self.send_data_to_nextjs(data)

                return result.text
            else:
                logger.warning("No speech detected or skipping the recording.")
                return None
        except Exception as e:
            logger.error(f"Error during transcription: {e}", exc_info=True)
            return None
