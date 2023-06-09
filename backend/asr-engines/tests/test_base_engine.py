import unittest
from unittest.mock import patch

from asr_engines.base_engine import BaseEngine


class MockEngine(BaseEngine):
    def get_model(self):
        pass

    def process(self, path_to_audio_file):
        pass


class TestBaseEngine(unittest.TestCase):
    @patch.object(MockEngine, 'get_model')
    @patch.object(MockEngine, 'process')
    def test_model_type(self, mock_get_model, mock_process):
        engine = MockEngine(model_path='/path/to/model', model_type='tiny')
        self.assertEqual(engine.model_type, 'tiny')

        engine = MockEngine(model_path='/path/to/model', model_type='invalid')
        self.assertIsNone(engine.model_type)

    @patch.object(MockEngine, 'get_model')
    @patch.object(MockEngine, 'process')
    def test_model_path(self, mock_get_model, mock_process):
        engine = MockEngine(model_path='/path/to/model', model_type='tiny')
        self.assertEqual(engine.model_path, '/path/to/model')


if __name__ == '__main__':
    unittest.main()
