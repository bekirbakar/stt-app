import logging

import whisper
from base.base_engine import BaseEngine


class Engine(BaseEngine):
    def __init__(self, **kwargs) -> None:
        super().__init__(**kwargs)

        self.logger = logging.getLogger(__name__)

        if self.model_type is None:
            self.model_type = 'tiny'

        self.model = self.get_model()

    def get_model(self) -> None:
        return whisper.load_model(name=self.model_type)

    def process(self, data_source) -> str:
        self.logger.info('Using openai/whisper engine.')
        self.logger.info(f'{self.model_path} {self.model_type} {self.device} '
                         f'{self.compute_type}')

        result = self.model.transcribe(data_source)

        return result['text']
