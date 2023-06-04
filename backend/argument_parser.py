import json
import logging


class ArgumentParser:
    logger = logging.getLogger(__name__)

    def __init__(self, **kwargs) -> None:
        self.engine = kwargs.get('engine', None)
        self.model_path = kwargs.get('modelPath', None)
        self.model_type = kwargs.get('modelType', None)
        self.device_type = kwargs.get('deviceType', None)
        self.compute_type = kwargs.get('computeType', None)

    @classmethod
    def from_file(cls, path_to_file: str):
        try:
            with open(path_to_file, 'r') as file:
                argument_parser = json.load(file)
        except json.JSONDecodeError:
            cls.logger.error(f'Invalid JSON File: {path_to_file}')
            raise
        return cls(**argument_parser)

    @classmethod
    def from_json(cls, json_string: str):
        try:
            argument_parser = json.loads(json_string)
        except json.JSONDecodeError:
            cls.logger.error(f'Invalid JSON String: {json_string}')
            raise
        return cls(**argument_parser)
