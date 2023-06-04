import os
import sys
import unittest
from unittest.mock import MagicMock, patch

import main

current_directory = os.path.dirname(os.path.abspath(__file__))
path_to_configuration_file = os.path.join(current_directory, '../../configuration/arguments-sample.json')
path_to_audio_file = os.path.join(current_directory, '../../data/audio-samples/jfk.wav')


class TestMain(unittest.TestCase):
    @patch('main.ArgumentParser')
    @patch('main.EngineInference')
    def test_main_with_file(self, mock_engine_inference, mock_argument_parser):
        mock_arguments = MagicMock()
        mock_argument_parser.from_file.return_value = mock_arguments

        mock_engine = MagicMock()
        mock_engine_inference.return_value = mock_engine

        with patch.object(sys, "argv", ["main.py", path_to_configuration_file, path_to_audio_file]):
            main.main()
            mock_argument_parser.from_file.assert_called_once_with(path_to_configuration_file)
            mock_engine_inference.assert_called_once_with(mock_arguments)
            mock_engine.run.assert_called_once_with(path_to_audio_file)

    @patch('main.ArgumentParser')
    @patch('main.EngineInference')
    def test_main_with_json(self, mock_engine_inference, mock_argument_parser):
        mock_arguments = MagicMock()
        mock_argument_parser.from_json.return_value = mock_arguments

        mock_engine = MagicMock()
        mock_engine_inference.return_value = mock_engine

        with patch.object(sys, "argv", ["main.py", '{"key": "value"}', path_to_audio_file]):
            main.main()
            mock_argument_parser.from_json.assert_called_once_with('{"key": "value"}')
            mock_engine_inference.assert_called_once_with(mock_arguments)
            mock_engine.run.assert_called_once_with(path_to_audio_file)


if __name__ == '__main__':
    unittest.main()
