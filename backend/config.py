# backend\config.py
import os

SAMPLE_RATE = 32000
CHUNK_DURATION_SECS = 0.5
BUFFER_DURATION_SECS = 40
SPEECH_BREAK_SECS = 1
NUM_WORKERS = 1

SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ewogICJyb2xlIjogInNlcnZpY2Vfcm9sZSIsCiAgImlzcyI6ICJzdXBhYmFzZSIsCiAgImlhdCI6IDE3MDY5MTg0MDAsCiAgImV4cCI6IDE4NjQ3NzEyMDAKfQ.I6ZIUDFnXtjzNjkLPj_1B8BThU9ZdrNaZhXpG-5_KeA"

SUPABASE_URL = "http://192.168.1.26:8000"
TRANSCRIPT_DIR = os.path.join("data.", "transcriptions")
ORIGINAL_RECORDINGS_DIR = os.path.join("data", "recordings")
PROFILER_DIR = os.path.join("data", "profiler")
LOGS_DIR = os.path.join("logs")

MODEL_NAME = "base"
# RECORDINGS_DIR = os.path.join("backend", "data", "recordings")
# TRANSCRIPT_DIR = os.path.join("backend", "data", "transcriptions")
# ORIGINAL_RECORDINGS_DIR = os.path.join("backend", "data", "recordings")
# PROFILER_DIR = os.path.join("backend", "data", "profiler")
# LOGS_DIR = os.path.join("backend", "logs")

