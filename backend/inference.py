import sys

import whisper


def transcribe_audio(target_file_path: str):
    model = whisper.load_model("tiny")
    result = model.transcribe(target_file_path)
    print(result["text"])


if __name__ == "__main__":
    target_file_path = sys.argv[1]
    transcribe_audio(target_file_path)
