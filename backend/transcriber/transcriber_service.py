# transcriber\transcriber_service.py

import datetime
import json
import logging
import time
import requests

import torch
import whisper

from config import MODEL_NAME, SUPABASE_ANON_KEY
from utils.load_model import WhisperModelLoader

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)


class TranscriberService:
    def __init__(self):
        self.whisper_model = None
        logger.debug("Transcriber service initialized.")

    # def send_data_to_nextjs(self, data):
    #     url = "http://localhost:3000/api/receive-data"
    #     logger.debug(f"Sending data to Next.js API at {url}")
    #     try:
    #         response = requests.post(url, json=data)
    #         logger.info(
    #             f"Data sent to Next.js | Status Code: {response.status_code} | Response: {response.json()}"
    #         )
    #         return response.status_code, response.json()
    #     except Exception as e:
    #         logger.error(f"Error sending data to Next.js: {e}", exc_info=True)
    #         return None

    # def add_transcription_to_table(
    #     speech_end_time,
    #     transcription_end_time,
    #     transcription_time,
    #     speech_length,
    #     transcription,
    # ):
    #     # Prepare the data
    #     data = {
    #         "speech_end_time": speech_end_time.strftime("%Y-%m-%d | %H:%M:%S.%f")[:-3],
    #         "transcription_end_time": transcription_end_time.strftime(
    #             "%Y-%m-%d | %H:%M:%S.%f"
    #         )[:-3],
    #         "transcription_time": f"{transcription_time} seconds",
    #         "speech_length": f"{speech_length} seconds",
    #         "transcription": transcription,
    #     }

    def add_transcription_to_table(self, data):
        url = "http://192.168.1.26:8000/rest/v1/transcriptions_table"
        logger.debug(f"Sending data to Supabase API at {url}")
        headers = {
            "apikey": SUPABASE_ANON_KEY,
            "Authorization": f"Bearer {SUPABASE_ANON_KEY}",
            "Content-Type": "application/json",
            "Prefer": "return=minimal",
        }

        data_json = json.dumps(data)
        logger.debug(f"Request Headers: {headers}")
        logger.debug(f"Request Payload: {data_json}")
        try:
            response = requests.post(url, headers=headers, data=data_json)
            logger.debug(f"Response Status Code: {response.status_code}")
            logger.debug(f"Response Body: {response.text}")

            # Handle different response status codes
            if response.status_code in [200, 201]:  # OK or Created
                # Parse JSON only if response is not empty
                return response.status_code, response.json() if response.text else {}
            else:
                logger.error(f"Non-successful response: {response.text}")
                return response.status_code, None
        except requests.exceptions.RequestException as req_error:
            logger.error(f"Request error: {req_error}", exc_info=True)
        except Exception as e:
            logger.error(f"Error sending data to Supabase: {e}", exc_info=True)
        return None

    def load_model(self):
        logger.debug(f"Loading Whisper model: {MODEL_NAME}")
        try:
            self.whisper_model = WhisperModelLoader.load_model(MODEL_NAME)
            logger.info("Whisper model loaded successfully.")
        except Exception as e:
            logger.error(f"Error loading Whisper model: {e}", exc_info=True)

    def process_audio_file(self, file_path):
        logger.debug(f"Processing audio file: {file_path}")
        try:
            audio = whisper.load_audio(file_path)
            audio = whisper.pad_or_trim(audio)
            audio_tensor = torch.from_numpy(audio).to(self.whisper_model.device)
            mel = whisper.log_mel_spectrogram(audio_tensor).to(
                self.whisper_model.device
            )
            logger.info("Audio file processed successfully.")
            return mel
        except Exception as e:
            logger.error(f"Error while processing audio file: {e}", exc_info=True)
            return None

    async def transcribe(
        self, file_path, speech_end_timestamp, buffer_length
    ):
        logger.debug(f"Starting transcription for file: {file_path}")
        try:
            mel = self.process_audio_file(file_path)
            if mel is None:
                logger.warning("Failed to process audio file for transcription.")
                return None

            options = whisper.DecodingOptions(language="en", fp16=False)
            result = whisper.decode(self.whisper_model, mel, options)
            # transcription_end_clock = datetime.datetime.utcnow()
            transcription_end_timestamp = datetime.datetime.utcnow()
            logger.info(
                f"###### Transcription Finish Time: {transcription_end_timestamp}"
            )

            # logger.debug(f"Transcription Complete | Time: {transcription_end_time}")

            # Calculate and log the transcription time
            transcription_time = transcription_end_timestamp - speech_end_timestamp
            logger.info(f"###### Speech End Time: {speech_end_timestamp}")
            # time_in_seconds = time_difference.total_seconds()
            # formatted_time = "{:.2f}".format(time_in_seconds)
            logger.info(f"###### Transcription time: {transcription_time} seconds")

            if result and result.no_speech_prob < 0.5:
                logger.info(f"###### Transcription result: {result.text}")

                # Create a data dictionary
                data = {
                    "user_id": "871fc14a-d733-4a5c-bc8e-1b21dab46a7b",
                    "content": result.text,
                    "speech_end_timestamp": speech_end_timestamp.isoformat(),
                    "transcription_end_timestamp": transcription_end_timestamp.isoformat(),
                    "transcription_time": transcription_time.total_seconds(),
                    "speech_length": buffer_length,
                    "audio_file_url": file_path,
                    "data_sent_timestamp": datetime.datetime.utcnow().isoformat(),
                }
                print("Data:")
                print(data)

                self.add_transcription_to_table(data)

                # # Send the data to Next.js
                # self.send_data_to_nextjs(data)

                return result.text
            else:
                logger.warning("No speech detected or skipping the recording.")
                return None
        except Exception as e:
            logger.error(f"Error during transcription: {e}", exc_info=True)
            return None
