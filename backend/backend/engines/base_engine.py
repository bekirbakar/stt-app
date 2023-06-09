import logging
from abc import ABC, abstractmethod
from typing import Any, Dict, Optional

from .enums import ModelType

__all__ = ['BaseEngine']


class BaseEngine(ABC):
    """
    Abstract base class for speech-to-text engines.

    Attributes:
        model_path (str): The path to the model.
        model_type (str): The type of the model.
    """

    def __init__(self, model_path: Optional[str] = None, model_type: ModelType = None) -> None:
        self.model_path = model_path

        self.model_type = model_type
        if model_type not in [item.value for item in ModelType.__members__.values()]:
            self.model_type = None

        self.logger = logging.getLogger(__name__)

    @abstractmethod
    def get_model(self) -> None:
        """
        Abstract method to get the model.
        """
        pass

    @abstractmethod
    def process(self, path_to_audio_file: Optional[str] = None) -> Dict[str, Any]:
        """
        Abstract method to process an audio file and return the transcription.

        Args:
            path_to_audio_file (str): The path of the audio data.

        Returns:
            Dict[str, Any]: The transcribed text and potentially other...
        """
        pass
