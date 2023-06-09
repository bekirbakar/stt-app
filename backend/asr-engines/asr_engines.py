import json
import logging
import os
import sys

from asr_engines import BaseEngine, FasterWhisperEngine, OpenAIWhisperEngine


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


class EngineInference:
    def __init__(self, arguments) -> None:
        self.engine = self.get_engine(arguments)

    def get_engine(self, arguments) -> BaseEngine:
        engine_factory = {'guillaumekln/faster-whisper': FasterWhisperEngine, 'openai/whisper': OpenAIWhisperEngine}

        if engine_class := engine_factory.get(arguments.engine):
            return engine_class(**arguments.__dict__)
        else:
            raise ValueError(f'Invalid Engine: {arguments.engine}')

    def run(self, path_to_audio_file) -> str:
        return json.dumps(self.engine.process(path_to_audio_file))


def main():
    if len(sys.argv) < 3:
        logging.error('Usage: python script.py <user_configuration> <path_to_audio_file>')
        sys.exit(1)

    user_configuration = sys.argv[1]
    path_to_audio_file = sys.argv[2]

    try:
        if os.path.isfile(user_configuration):
            arguments = ArgumentParser.from_file(user_configuration)
        else:
            arguments = ArgumentParser.from_json(user_configuration)
        engine_inference = EngineInference(arguments)
        print(engine_inference.run(path_to_audio_file))
    except Exception as exception:
        logging.error(exception)
        sys.exit(1)


if __name__ == '__main__':
    main()
