import json
import os
import unittest

from argument_parser import ArgumentParser


class TestArgumentParser(unittest.TestCase):
    def test_from_file(self):
        test_file_path = "arguments.json"
        test_content = {"engine": "test_engine", "modelPath": "test_model_path", "modelType": "test_model_type",
                        "deviceType": "test_device_type", "computeType": "test_compute_type"}
        with open(test_file_path, "w") as f:
            f.write(json.dumps(test_content))

        arguments = ArgumentParser.from_file(test_file_path)

        self.assertEqual(arguments.engine, test_content["engine"])
        self.assertEqual(arguments.model_path, test_content["modelPath"])
        self.assertEqual(arguments.model_type, test_content["modelType"])
        self.assertEqual(arguments.device_type, test_content["deviceType"])
        self.assertEqual(arguments.compute_type, test_content["computeType"])

        os.remove(test_file_path)

    def test_from_file_invalid_json(self):
        test_file_path = "arguments.json"
        with open(test_file_path, "w") as f:
            f.write('{"engine": "test_engine", "modelPath": }')

        with self.assertRaises(json.JSONDecodeError):
            ArgumentParser.from_file(test_file_path)

        os.remove(test_file_path)

    def test_from_json(self):
        test_string = ('{"engine": "test_engine", "modelPath": "test_model_path", "modelType": "test_model_type", '
                       '"deviceType": "test_device_type", "computeType": "test_compute_type"}')

        arguments = ArgumentParser.from_json(test_string)

        self.assertEqual(arguments.engine, "test_engine")
        self.assertEqual(arguments.model_path, "test_model_path")
        self.assertEqual(arguments.model_type, "test_model_type")
        self.assertEqual(arguments.device_type, "test_device_type")
        self.assertEqual(arguments.compute_type, "test_compute_type")

    def test_from_json_invalid(self):
        test_string = '{"engine": "test_engine", "modelPath": }'

        with self.assertRaises(json.JSONDecodeError):
            ArgumentParser.from_json(test_string)


if __name__ == '__main__':
    unittest.main()
