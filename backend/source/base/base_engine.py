from abc import ABC, abstractmethod


class BaseEngine(ABC):
    def __init__(self, model_path: str = None,
                 model_type: str = None,
                 device: str = None, compute_type: str = None) -> None:
        self.model_path = model_path
        self.model_type = model_type
        self.device = device
        self.compute_type = compute_type

    @abstractmethod
    def get_model(self) -> None:
        pass

    @abstractmethod
    def process(self, data_source: str = None) -> str:
        pass
