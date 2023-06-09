import os

from setuptools import find_packages, setup

base_directory = os.path.dirname(os.path.abspath(__file__))


def get_requirements(path):
    with open(path, encoding="utf-8") as requirements:
        return [item.strip() for item in requirements if item.strip() and not item.startswith("#")]


install_requires = get_requirements(os.path.join(base_directory, "requirements.txt"))

setup(
    name="asr_engines",
    version="0.1.0",
    description="",
    author="Bekir Bakar",
    url="",
    license='MIT',
    classifiers=[
        'Intended Audience :: Developers',
        'Programming Language :: Python :: 3.8',
    ],
    keywords="",
    python_requires=">=3.8",
    install_requires=install_requires,
    extras_require={
        "dev": [
            "pyinstaller",
        ],
    },
    packages=find_packages(exclude=['__pycache__', '*.pyc', '*.pyo', '.DS_Store']),
    include_package_data=True,
    package_data={},
    test_suite='tests',
)
