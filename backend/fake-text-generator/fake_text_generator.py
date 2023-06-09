import sys
from time import sleep

import faker


def generate_dummy_text() -> str:
    fake: str = faker.Faker()
    sentences: list = [fake.sentence() for _ in range(10)]
    return ' '.join(sentences)


def main() -> None:
    while True:
        line: str = input('')
        sleep(10)

        if 'generate' in line:
            print(generate_dummy_text())
        elif 'exit' in line:
            sys.exit()
        else:
            print('Unknown command!')
            continue


if __name__ == "__main__":
    main()
