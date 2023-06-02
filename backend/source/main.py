import json
import logging
import os
import sys

logging.basicConfig(level=logging.INFO,
                    format='%(asctime)s - %(levelname)s - %(message)s',
                    datefmt='%d-%b-%y %H:%M:%S',
                    filename='backend.log')


class Parameters:
    def __init__(self, path_to_parameters_file) -> None:
        self.logger = logging.getLogger(__name__)
        try:
            with open(path_to_parameters_file, 'r') as file:
                parameters = json.load(file)
        except FileNotFoundError:
            self.logger.error(f'No such file: {path_to_parameters_file}')
            sys.exit(1)
        except json.JSONDecodeError:
            self.logger.error(f'Invalid JSON file: {path_to_parameters_file}')
            sys.exit(1)

        self.engine = parameters.get('engine', None)
        self.model_path = parameters.get('modelPath', None)
        self.model_type = parameters.get('modelType', None)
        self.device = parameters.get('device', None)
        self.compute_type = parameters.get('computeType', None)
        self.path_to_audio_file = parameters.get('pathToAudioFile', None)


class EngineInference:
    def __init__(self, parameters) -> None:
        self.parameters = parameters
        sys.path.insert(0, os.path.join(os.getcwd(), self.parameters.engine))

        from engine import Engine
        self.engine = Engine(model_path=self.parameters.model_path,
                             model_type=self.parameters.model_type,
                             device=self.parameters.device,
                             compute_type=self.parameters.compute_type)

    def run(self, data) -> str:
        return self.engine.process(data)


if __name__ == '__main__':
    if len(sys.argv) < 2:
        logging.error('Usage: python script.py <path_to_parameters_file>')
        sys.exit(1)

    path_to_parameters_file = sys.argv[1]
    parameters = Parameters(path_to_parameters_file)

    engine_inference = EngineInference(parameters)
    print(engine_inference.run(parameters.path_to_audio_file))
