import unittest

from engines.enums import ModelType, ComputeType, DeviceType


class TestEnums(unittest.TestCase):
    def test_model_types(self):
        self.assertEqual(ModelType.TINY.value, 'tiny')
        self.assertEqual(ModelType.SMALL.value, 'small')
        self.assertEqual(ModelType.MEDIUM.value, 'medium')
        self.assertEqual(ModelType.LARGE.value, 'large')

    def test_compute_types(self):
        self.assertEqual(ComputeType.INT8.value, 'int8')
        self.assertEqual(ComputeType.INT16.value, 'int16')

    def test_device_types(self):
        self.assertEqual(DeviceType.CPU.value, 'cpu')
        self.assertEqual(DeviceType.GPU.value, 'gpu')


if __name__ == '__main__':
    unittest.main()
