import os
import string
import unittest
from unittest.mock import patch

from engines.enums import ModelType
from engines.openai_whisper_engine import OpenAIWhisperEngine

current_directory = os.path.dirname(os.path.abspath(__file__))
path_to_audio_file = os.path.join(current_directory, '../../data/audio-samples/jfk.wav')
expected_transcription = ("and so my fellow americans ask not what your country can do for you ask what you "
                          "can do for your country")


class TestOpenAIWhisperEngine(unittest.TestCase):
    def setUp(self):
        self.engine = OpenAIWhisperEngine(model_type=ModelType.TINY.value)

    @patch('engines.openai_whisper_engine.whisper.load_model', autospec=True)
    def test_get_model(self, mock_load_model):
        self.engine.get_model()
        mock_load_model.assert_called_once_with(name=ModelType.TINY.value)

    def test_process_actual(self):
        result = self.engine.process(path_to_audio_file)
        transcription = result["transcription"].lower().strip().translate(str.maketrans('', '', string.punctuation))
        self.assertEqual(transcription, expected_transcription)


if __name__ == '__main__':
    unittest.main()
