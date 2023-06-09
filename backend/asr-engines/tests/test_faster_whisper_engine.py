import os
import string
import unittest
from unittest.mock import patch

from asr_engines.enums import ComputeType, DeviceType, ModelType
from asr_engines.faster_whisper_engine import FasterWhisperEngine

current_directory = os.path.dirname(os.path.abspath(__file__))
path_to_audio_file = os.path.join(current_directory, '../../../data/audio-samples/jfk.wav')
expected_transcription = ("and so my fellow americans ask not what your country can do for you ask what you "
                          "can do for your country")


class TestFasterWhisperEngine(unittest.TestCase):
    def setUp(self):
        self.engine = FasterWhisperEngine(model_type=ModelType.TINY.value, compute_type=ComputeType.INT8.value,
                                          device_type=DeviceType.CPU.value)

    @patch('asr_engines.faster_whisper_engine.WhisperModel', autospec=True)
    def test_get_model(self, mock_model):
        self.engine.get_model()
        mock_model.assert_called_once_with(model_size_or_path=ModelType.TINY.value, device=DeviceType.CPU.value,
                                           compute_type=ComputeType.INT8.value)

    def test_process_actual(self):
        result = self.engine.process(path_to_audio_file)
        transcription = result["transcription"].lower().strip().translate(str.maketrans('', '', string.punctuation))
        self.assertEqual(transcription, expected_transcription)


if __name__ == '__main__':
    unittest.main()
