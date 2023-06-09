from enum import Enum

__all__ = ['ModelType', 'ComputeType', 'DeviceType']


class ModelType(Enum):
    TINY = 'tiny'
    SMALL = 'small'
    MEDIUM = 'medium'
    LARGE = 'large'


class ComputeType(Enum):
    INT8 = 'int8'
    INT16 = 'int16'


class DeviceType(Enum):
    CPU = 'cpu'
    GPU = 'gpu'
