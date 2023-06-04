import logging

from base.base_engine import BaseEngine
from faster_whisper import WhisperModel


class Engine(BaseEngine):
    def __init__(self, **kwargs) -> None:
        super().__init__(**kwargs)

        self.logger = logging.getLogger(__name__)

        if self.model_path:
            self.model_size_or_path = self.model_path
        else:
            self.model_size_or_path = self.model_type

        if self.model_type is None:
            self.model_type = 'tiny'

        if self.device is None:
            self.device = 'cpu'

        if self.compute_type is None:
            self.compute_type = 'cpu'

        self.model = self.get_model()

    def get_model(self):
        return WhisperModel(model_size_or_path=self.model_size_or_path,
                            device=self.device, compute_type=self.compute_type)

    def process(self, path_to_audio_file) -> str:
        self.logger.info('Using guillaumekln/faster-whisper engine.')
        self.logger.info(f'{self.model_path} {self.model_type} {self.device} '
                         f'{self.compute_type}')

        segments, _ = self.model.transcribe(path_to_audio_file)

        return ' '.join([segement.text for segement in segments])
