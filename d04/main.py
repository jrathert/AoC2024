#!/usr/bin/env python3

import re
from sys import argv
from time import process_time

tasks: list[int] = [1, 2]
test_only: bool = True

def solve():
    inputf = "input_testdata.txt" if test_only else "input.txt"

    start = process_time()

    puzzle = open(inputf).read()

    # idea: create 3 data structures:
    #  - 1: all rows appended
    #  - 2: all columns appended
    #  - 3: all diagonals appended
    # then search for "XMAS" and "SMAX" in each

    lines = puzzle.strip().splitlines()
    n = len(lines)
    m = len(lines[0])

    # 1
    one = "".join(lines)
    one_lines = lines

    # 2
    buff = []
    two_lines = []
    for j in range(m):
        b = []
        for i in range(n):
            buff.append(lines[i][j])
            b.append(lines[i][j])
        two_lines.append(''.join(b))
    two = ''.join(buff)

    # 3
    buff = []
    three_lines = []
    for x in range(m-4, 0, -1):
        b = []
        cnt = 0
        while x + cnt < m:
            b.append(lines[cnt][x+cnt])
            buff.append(lines[cnt][x+cnt])
            cnt += 1
        three_lines.append(''.join(b))
    for x in range(3, m):
        b = []
        cnt = 0
        while x - cnt >= 0:
            b.append(lines[cnt][x-cnt])
            buff.append(lines[cnt][x-cnt])
            cnt += 1
        three_lines.append(''.join(b))


    for y in range(n-3):
        b = []
        cnt = 0
        while y + cnt < n:
            b.append(lines[y+cnt][cnt])
            buff.append(lines[y+cnt][cnt])
            cnt += 1
        three_lines.append(''.join(b))
    for y in range(1, n-3):
        b = []
        cnt = 0
        while y + cnt < n:
            b.append(lines[y+cnt][m-1-cnt])
            buff.append(lines[y+cnt][m-1-cnt])
            cnt += 1
        three_lines.append(''.join(b))

    three = ''.join(buff)

    all_lines = one_lines + two_lines + three_lines
    load = process_time()

    # action
    if 1 in tasks:
        cnt = 0
        for l in all_lines:
            cnt += len(re.findall(r'XMAS', l))
            cnt += len(re.findall(r'SAMX', l))
        # cnt += len(re.findall(r'XMAS', two))
        # cnt += len(re.findall(r'SAMX', two))
        # cnt += len(re.findall(r'XMAS', three))
        # cnt += len(re.findall(r'SAMX', three))
        print(f"Task 1: {cnt} occurences")
        # task 1: ...
        pass
    
    if 2 in tasks:
        cnt = 0
        lst = []
        for i in range(1, m-1):
            for j in range (1, n-1):
                if (lines[i][j] == 'A'):
                    lt = lines[i-1][j-1]
                    rt = lines[i-1][j+1]
                    lb = lines[i+1][j-1]
                    rb = lines[i+1][j+1]
                    if (lt == 'M' and rb == 'S' or lt == 'S' and rb == 'M') and (rt == 'M' and lb == 'S' or rt == 'S' and lb == 'M'):
                        cnt += 1
                        lst.append((i,j))
        print(f"Task 2: {cnt} occurences")
        # task 2: ...
        pass

    stop = process_time()

    print(f"Load took {load-start:3.6f} secs, calculation {stop-load:3.6f} secs")


def main(argv):
    global tasks, test_only

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

