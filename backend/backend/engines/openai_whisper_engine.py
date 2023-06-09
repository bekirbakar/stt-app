import whisper

from .base_engine import BaseEngine
from .enums import ModelType

__all__ = ['OpenAIWhisperEngine']


class OpenAIWhisperEngine(BaseEngine):
    DEFAULT_MODEL_TYPE = ModelType.TINY

    def __init__(self, **kwargs) -> None:
        super().__init__(model_path=kwargs.get('model_path', None), model_type=kwargs.get('model_type', None))

        if self.model_path:
            self.model_size_or_path = self.model_path
        elif not self.model_type:
            self.model_type = self.DEFAULT_MODEL_TYPE.value
            self.model_size_or_path = self.model_type
        else:
            self.model_size_or_path = self.model_type

        self.model = None

    def get_model(self):
        if not self.model:
            self.model = whisper.load_model(name=self.model_size_or_path)

        return self.model

    def process(self, path_to_audio_file: str) -> dict:
        self.logger.info(f'Using: {__name__}')
        self.logger.info(f'Using: {self.model_path or self.model_type}')

        result = self.get_model().transcribe(path_to_audio_file)

        return {"transcription": result['text']}
