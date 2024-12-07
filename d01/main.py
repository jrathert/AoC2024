#!/usr/bin/env python3

from collections import Counter
from sys import argv
from time import process_time

tasks: list[int] = [1, 2]
test_only: bool = True

def solve():
    inputf = "input_testdata.txt" if test_only else "input.txt"

    start = process_time()

    puzzle = open(inputf).read()
    all_ints = [int(n) for n in puzzle.split()]
    a = sorted(all_ints[::2])
    b = sorted(all_ints[1::2])

    load = process_time()

    if 1 in tasks:
        # task 1: sum up the absolute differences of the values
        print(sum([abs(x-y) for x, y in zip(a, b)]))
    
    if 2 in tasks:
        # task 2: sum up the product of each value in list 1 multiplied by number of occurence in list 2
        counter = Counter(b)
        totals = sum([v * counter[v] for v in a])
        print(totals)

    stop = process_time()

    print(f"Load took {load-start:3.6f} secs, calculation {stop-load:3.6f} secs")


def main(argv):
    global test_only, tasks

    if "-h" in argv or "--help" in argv:
        print("usage: python3 main.py [-h] [-s] [-1|2]")
        print("  -h:    this help")
        print("  -s:    execute large scale problem, not just example/test set, which is the default")
        print("  -1|2:  task 1 or 2, respectively (default: both tasks)")
        exit(1)

    tasks = [2] if "-2" in argv else [1] if "-1" in argv else [1,2]

    test_only = False if "-s" in argv else True

    print(f"\n===> Running task(s) {tasks} in {'test' if test_only else 'full'} mode ===================================\n")

    solve()


if __name__ == "__main__":
    main(argv)

    # read, eg, 5,6, and return as list of int tupels
    # input = "5,6\n3,4\n2,3"
    # lst = list(tuple((int(x), int(y))) for x, y in re.findall('([0-9]+),([0-9]+)', input))

    # read alphaanumeric (incl '_'), and return as list of lists
    # input = "key -> value\nk2 -> val_2\nk3 -> v3"
    # lst = list( [ x, y ] for x, y in re.findall('([\w]+) -> ([\w]+)', input))
    # print (lst)

    # ... or as dict
    # dct = dict( [ x, y ] for x, y in re.findall('([\w]+) -> ([\w]+)', input))
    # print(dct)

