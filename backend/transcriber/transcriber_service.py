# transcriber\transcriber_service.py

import datetime
import json
import logging
import time
import torch
import whisper
import websockets
from colorama import Fore, Style, init

from config import MODEL_NAME, SUPABASE_ANON_KEY
from utils.load_model import WhisperModelLoader

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)

init(autoreset=True)


class TranscriberService:
    def __init__(self):
        self.whisper_model = None
        self.websocket_uri = "ws://localhost:8765"
        logger.debug("Transcriber service initialized.")

    # def add_transcription_to_table(self, data):
    #     url = "http://192.168.1.26:8000/rest/v1/transcriptions_table"
    #     logger.debug(f"Sending data to Supabase API at {url}")
    #     headers = {
    #         "apikey": SUPABASE_ANON_KEY,
    #         "Authorization": f"Bearer {SUPABASE_ANON_KEY}",
    #         "Content-Type": "application/json",
    #         "Prefer": "return=minimal",
    #     }

    #     data_json = json.dumps(data)
    #     logger.debug(f"Request Headers: {headers}")
    #     logger.debug(f"Request Payload: {data_json}")
    #     try:
    #         response = requests.post(url, headers=headers, data=data_json)
    #         logger.debug(f"Response Status Code: {response.status_code}")
    #         logger.debug(f"Response Body: {response.text}")

    #         # Handle different response status codes
    #         if response.status_code in [200, 201]:  
    #             return response.status_code, response.json() if response.text else {}
    #         else:
    #             logger.error(f"Non-successful response: {response.text}")
    #             return response.status_code, None
    #     except requests.exceptions.RequestException as req_error:
    #         logger.error(f"Request error: {req_error}", exc_info=True)
    #     except Exception as e:
    #         logger.error(f"Error sending data to Supabase: {e}", exc_info=True)
    #     return None

    async def send_transcription_via_websocket(self, data):
        async with websockets.connect(self.websocket_uri) as websocket:
            await websocket.send(json.dumps(data))
            logger.debug("Sent transcription data via WebSocket.")

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
            mel = whisper.log_mel_spectrogram(audio_tensor).to(self.whisper_model.device)
            logger.info("Audio file processed successfully.")
            return mel
        except Exception as e:
            logger.error(f"Error while processing audio file: {e}", exc_info=True)
            return None

    async def transcribe(self, file_path, speech_end_timestamp, buffer_length):
        start_time = datetime.datetime.utcnow()
        logger.debug(f"Starting transcription for file: {file_path}")

        try:
            file_load_start = datetime.datetime.utcnow()
            file_load_end = datetime.datetime.utcnow()

            print(Fore.CYAN + f"File Load Time: {(file_load_end - file_load_start).total_seconds():.2f} seconds")

            process_start = datetime.datetime.utcnow()
            mel = self.process_audio_file(file_path)
            process_end = datetime.datetime.utcnow()

            print(Fore.CYAN + f"Audio Processing Time: {(process_end - process_start).total_seconds():.2f} seconds")

            if mel is None:
                logger.warning("Failed to process audio file for transcription.")
                return None

            decode_start = datetime.datetime.utcnow()
            options = whisper.DecodingOptions(language="en", fp16=False)
            result = whisper.decode(self.whisper_model, mel, options)
            decode_end = datetime.datetime.utcnow()

            # Log decoding time
            print(Fore.CYAN + f"Decoding Time: {(decode_end - decode_start).total_seconds():.2f} seconds")

            transcription_end_timestamp = datetime.datetime.utcnow()
            transcription_time = transcription_end_timestamp - speech_end_timestamp

            logger.info(f"###### Speech End Time: {speech_end_timestamp}")
            logger.info(f"###### Transcription time: {transcription_time} seconds")

            if result and result.no_speech_prob < 0.5:
                logger.info(f"###### Transcription result: {result.text}")

                # Create a data dictionary
                data = {
                    "content": result.text,
                    "speech_end_timestamp": speech_end_timestamp.isoformat(),
                    "transcription_time": transcription_time.total_seconds(),
                }

                await self.send_transcription_via_websocket(data)

                # Print the results in a user-friendly format
                print(Fore.GREEN + "Transcription Result:")
                print(Fore.YELLOW + f"Content: {result.text}")
                print(Fore.CYAN + f"Speech End Timestamp: {speech_end_timestamp.strftime('%Y-%m-%d %H:%M:%S.%f')[:-3]}")
                print(Fore.MAGENTA + f"Transcription Time: {transcription_time.total_seconds():.2f} seconds")
                print(Fore.BLUE + f"File Length: {buffer_length:.2f} seconds")

                total_time = datetime.datetime.utcnow() - start_time
                print(Fore.CYAN + f"Total Time: {total_time.total_seconds():.2f} seconds")

                return result.text
            else:
                logger.warning("No speech detected or skipping the recording.")
                return None
        except Exception as e:
            print(Fore.RED + f"Error during transcription: {e}")
            logger.error(f"Error during transcription: {e}", exc_info=True)
            return None
