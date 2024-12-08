#!/usr/bin/env node

// Note: I am just learning JavaScript (not from "ground up", I know several languages like C, C++, Java, Python, ...),
// but more like how to work best with lists, dictionaires, etc., and getting "hands on experience"
// You will find a lot of boilerplate code here, and also some of my solutions might suffer from the fact that
// I am still learning. You have been warned... ;-)

import { readFileSync } from 'node:fs';
import { exit } from 'node:process';

function load_data(test_only) {
    const dir = import.meta.dirname
    if (test_only) {
        return readFileSync(dir + '/input_testdata.txt', 'utf8')
    } else {
        return readFileSync(dir + '/input.txt', 'utf8')
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

function is_safe(report) {
    if (report.length > 1) {
        let sign = report[1] - report[0]
        for (let i = 0; i < report.length-1; i++) {
            const diff = report[i+1] - report[i]
            if (diff == 0 || diff * sign < 0 || Math.abs(diff) > 3) {
                // either 0 or change of sign or diff too big => error
                return { valid: false, errorIndex: i }
            }
        }
    }
    return { valid: true, errorIndex: 0 }
}

// Part 1 is straightforward: Iterate over all lines and check if the
// corresponding report/vector is safe. Store unsafe items as well as the 
// index where the error occured - this will be reused for part 2

let unsafe_lines = {}
let safe_cnt = 0

if (tasks.includes(1)) {
    for (let i = 0; i < lines.length; i++) {
        let vec = lines[i].split(" ").map(Number)
        let res = is_safe(vec)
        if (!res.valid) {
            unsafe_lines[i] = res
        } 
        // console.log(`checking report [${vec}] -> ${res.valid}: ${res.errorIndex}`)
    }
    safe_cnt = lines.length - Object.keys(unsafe_lines).length
    console.log(`Part 1: Out of ${lines.length} reports, ${safe_cnt} are safe`)    
}

// Part 2 reuses results of part 1: For all lines that have been identified
// as unsafe, try if they can be fixed by taking out respective elements
// Note: Part 1 and 2 can easily be combined to make this more efficient

if (tasks.includes(2)) {
    if (!tasks.includes(1)) {
        console.log("run task 1 first, as we need its results")
        exit(1)
    }
    for (let idx of Object.keys(unsafe_lines)) {
        let errVec = lines[idx].split(" ").map(Number)
        let errIdx = unsafe_lines[idx].errorIndex

        // check if the error can be fixed by
        //  - taking out the element at errIdx
        //  - taking out the element at errIdx + 1
        //  - taking out the element 0 if errIdx == 1
        let vec = errVec.slice(0, errIdx).concat(errVec.slice(errIdx+1))
        let res = is_safe(vec)
        if (!res.valid) {
            vec = errVec.slice(0, errIdx+1).concat(errVec.slice(errIdx+2))
            res = is_safe(vec)
            if (!res.valid && errIdx == 1) {
                vec = errVec.slice(1)
                res = is_safe(vec)
            }
        }
        safe_cnt += res.valid ? 1 : 0 
    }
    console.log(`Part 2: Out of ${lines.length} reports, ${safe_cnt} are now safe`)    
}

let stop = performance.now()

console.log(`Load took ${((load-start)/1000).toFixed(6)} msecs, calculation ${((stop-load)/1000).toFixed(6)} msecs`)
