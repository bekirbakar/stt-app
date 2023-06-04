import json
import logging
import os
import sys

from argument_parser import ArgumentParser
from engines import BaseEngine, FasterWhisperEngine, OpenAIWhisperEngine


class EngineInference:
    def __init__(self, arguments) -> None:
        self.engine = self.get_engine(arguments)

    def get_engine(self, arguments) -> BaseEngine:
        engine_factory = {'guillaumekln/faster-whisper': FasterWhisperEngine, 'openai/whisper': OpenAIWhisperEngine}

        if engine_class := engine_factory.get(arguments.engine):
            return engine_class(**arguments.__dict__)
        else:
            raise ValueError(f'Invalid engine: {arguments.engine}')

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
