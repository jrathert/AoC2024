#!/usr/bin/env python3

from sys import argv
from time import process_time

tasks: list[int] = [1, 2]
test_only: bool = True

def split_vec(vec: list[int]) -> list[list[int]]:
    ret = []
    for i in range(len(vec)):
        ret.append(vec[0:i] + vec[i+1:])
    return ret

def is_safe(report: list[int], ident="") -> (bool, int): # type: ignore
    # print(f"{ident}checking report part {report}", end="")
    if (len(report) == 1):
        # print(" -> True")
        return True, 1
    sign = report[1] - report[0]
    for i in range(len(report)-1):
        diff = report[i+1] - report[i]
        if diff == 0 or diff*sign < 0 or abs(diff) > 3:
            # print(" -> False: ", i)
            return False, i
    # print(" -> True")
    return True, 1

def solve():
    inputf = "input_testdata.txt" if test_only else "input.txt"

    start = process_time()

    puzzle = open(inputf).read()
    lines = puzzle.strip().splitlines()

    load = process_time()

    # action
    if 1 in tasks:
        safe_cnt = 0
        for l in lines:
            vec = [int(n) for n in l.split()]
            safe, idx = is_safe(vec)
            if safe:
                safe_cnt +=1
        print(f"Task 1: Out of {len(lines)} reports, {safe_cnt} are safe")
    
    if 2 in tasks:
        safe_cnt = 0
        safe_lines = []
        # safe_lines2 = []
        for num, l in enumerate(lines):
            vec = [int(n) for n in l.split()]
            safe, idx = is_safe(vec)
            if safe: 
                safe_lines.append(num)
                # safe_lines2.append(num)
                safe_cnt +=1
            else:

                # brute force, correct
                vv = split_vec(vec)
                for i, v in enumerate(vv):
                    ident = f"  {i}: "
                    safe, ign = is_safe(v, ident)
                    if safe:
                        safe_lines.append(num)
                        safe_cnt +=1
                        break
                
                # smart, but wrong
                # vec1 = vec[0:idx] + vec [idx+1:]
                # vec2 = vec[0:idx+1] + vec [idx+2:]
                # safe, idx = is_safe(vec1, " 1:  ")
                # if safe:
                #     safe_lines2.append(num)
                # else:
                #     safe, idx = is_safe(vec2, " 2:  ")
                #     if safe:
                #         safe_lines2.append(num)

    print(f"Taks 2: Out of {len(lines)} reports, {safe_cnt} are safe")
    # print(len(safe_lines))
    # print(len(safe_lines2))
    # print(list(set(safe_lines) - set(safe_lines2)))

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

