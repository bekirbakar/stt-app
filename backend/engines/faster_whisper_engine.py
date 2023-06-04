from faster_whisper import WhisperModel

from .base_engine import BaseEngine
from .enums import ComputeType, DeviceType, ModelType

__all__ = ['FasterWhisperEngine']


class FasterWhisperEngine(BaseEngine):
    DEFAULT_MODEL_TYPE = ModelType.TINY
    DEFAULT_COMPUTE_TYPE = ComputeType.INT8
    DEFAULT_DEVICE_TYPE = DeviceType.CPU

    def __init__(self, **kwargs) -> None:
        super().__init__(model_path=kwargs.get('model_path', None), model_type=kwargs.get('model_type', None))

        if self.model_path:
            self.model_size_or_path = self.model_path
        elif not self.model_type:
            self.model_type = self.DEFAULT_MODEL_TYPE.value
            self.model_size_or_path = self.model_type
        else:
            self.model_size_or_path = self.model_type

        self.compute_type = kwargs.get('compute_type', None)
        if self.compute_type not in [item.value for item in ComputeType.__members__.values()]:
            self.compute_type = self.DEFAULT_COMPUTE_TYPE.value

        self.device_type = kwargs.get('device_type', None)
        if self.device_type not in [item.value for item in DeviceType.__members__.values()]:
            self.device_type = self.DEFAULT_DEVICE_TYPE.value

        self.model = None

    def get_model(self) -> None:
        if not self.model:
            self.model = WhisperModel(model_size_or_path=self.model_size_or_path,
                                      device=self.device_type, compute_type=self.compute_type)
        return self.model

    def process(self, path_to_audio_file: str) -> dict:
        self.logger.info(f'Using: {__name__}')
        self.logger.info(f'Using: {self.model_size_or_path}, {self.compute_type}, {self.device_type}')

        segments, _ = self.get_model().transcribe(path_to_audio_file)

        return {"transcription": ' '.join([segment.text for segment in segments])}
