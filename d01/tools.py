
from collections import Counter
import re

def ints(input: str) -> list[int]:
    return list(map(int, re.findall(r'[0-9]+', input)))

def digits(input: str) -> list[int]:
    return list(map(int, re.findall(r'[0-9]{1}', input)))

def absdiff(a, b):
    return a-b if a>b else b-a

def transpose(lst):
    # transpoe a list of lists (l), see https://stackoverflow.com/questions/6473679/transpose-list-of-lists
    return 





if __name__ == "__main__":

    # s = "3s44"
    # print(ints(s))
    # print(digits(s))

    s = [1, 2, 3, 5]
    t = [4, 3, 1, 6]

    c = Counter(t)
    print(c)

    v = c[5]
    print(v)

    