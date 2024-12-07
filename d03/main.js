#!/usr/bin/env node

// Note: I am just learning JavaScript (not from "ground up", I know several languages like C, C++, Java, Python, ...),
// but more like how to work best with lists, dictionaires, etc., and getting "hands on experience"
// You will find a lot of boilerplate code here, and also some of my solutions might suffer from the fact that
// I am still learning. You have been warned... ;-)

import { readFileSync } from 'node:fs';
import { exit } from 'node:process';

function load_data(test_only) {
    if (test_only) {
        return readFileSync('./input_testdata.txt', 'utf8')
    } else {
        return readFileSync('./input.txt', 'utf8')
    }
}

if (process.argv.includes("-h") || process.argv.includes("--help")) {
    console.log("usage: node main.js [-h] [-s] [-1|2]")
    console.log("  -h:    this help")
    console.log("  -s:    execute large scale problem, not just example/test set, whiich is the default")
    console.log("  -1|2:  task 1 or 2 only, repectively (default: both tasks)")
    exit(1)
}

let tasks = process.argv.includes("-2") ? [2] : process.argv.includes("-1") ? [1] : [1, 2]
let test_only = process.argv.includes("-s") ? false : true

let start = performance.now()

// As part of my "boilerplate" I read data into an array of lines of strings
// and keep track of the dimension (m = number of columns, n = number of rows)

let data = load_data(test_only)
let lines = data.trim().split('\n')
let n = lines.length
let m = lines[0].length
console.log(`Size: ${n}x${m}`)

let load = performance.now()

// Actual problem solving starts here ===========================================================================

// Part 1 could be solved by using a simple regular expression, extracting relevant number using the
// group feature of regexp. By that, one gets the two factors in each match and can easily multiply them

if (tasks.includes(1)) {
    const re = /mul\((\d+),(\d+)\)/g
    const matches = data.matchAll(re)
    let totals = 0
    for (const m of matches) {
        totals += m[1] * m[2]
    }
    console.log(`Part 1: sum is ${totals}`)
}

// Part 2 is a little bit more difficult: One needs the do()s and don't()s
// as well and while iterating over matches check whether the results of the multiplication
// do actually count. Not sure whether this can be expressed by a regexp?

if (tasks.includes(2)) {
    const re = /mul\((\d+),(\d+)\)|don\'t\(\)|do\(\)/g
    const matches = data.matchAll(re)
    let totals = 0
    let do_mul = true
    for (const m of matches) {
        if (m[0] == "don't()") {
            do_mul = false
        }
        else if (m[0] == "do()") {
            do_mul = true
        }
        else if (do_mul) {
            totals += m[1] * m[2]
        }
    }
    console.log(`Part 2: sum is ${totals}`)
}

let stop = performance.now()

console.log(`Load took ${((load-start)/1000).toFixed(6)} msecs, calculation ${((stop-load)/1000).toFixed(6)} msecs`)
