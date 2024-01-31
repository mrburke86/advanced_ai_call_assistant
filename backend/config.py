# backend\config.py
import os

SAMPLE_RATE = 32000
CHUNK_DURATION_SECS = 0.5
BUFFER_DURATION_SECS = 40
SPEECH_BREAK_SECS = 1
NUM_WORKERS = 1

TRANSCRIPT_DIR = os.path.join("backend", "data", "transcriptions")
ORIGINAL_RECORDINGS_DIR = os.path.join("backend", "data", "original")
RECORDINGS_DIR = os.path.join("backend", "data", "recordings")
PROFILER_DIR = os.path.join("backend", "data", "profiler")
LOGS_DIR = os.path.join("backend", "logs")

MODEL_NAME = "base"
