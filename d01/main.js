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

// This day, I do not need the lines, but can read the numbers of the two columns directly from the data,
// and then sorting by their values - learning about JavaScript regex as well as map() on day 1 - yeah!
let all_numbers = data.trim().split(/ +|\n/).map(Number)
let a = all_numbers.filter((_elem, idx) => { return idx%2 == 0 }).sort()
let b = all_numbers.filter((_elem, idx) => { return idx%2 == 1 }).sort()

// a helper class I used in part 2 - inspired by Pythons Counter class
class Counter {
    constructor(array) {
        this.dict = {}
        for (const a of array) {
            this.dict[a] = (this.dict[a] ?? 0) + 1
        }
    }

    val(num) {
        return this.dict[num] ?? 0
    }
}

// Part 1 is easy by just iterating over the two columns and adding up their 
// absolute differences

if (tasks.includes(1)) {

    let totals = 0
    for (let i = 0; i < a.length; i++) {
        totals += Math.abs(a[i]-b[i]) 
    }
    console.log(`Part 1: ${totals}`)    
}

// Part 2 leverages the Counter class above to count occurences in the second column
// and then reducing a with it

if (tasks.includes(2)) {
    let counter = new Counter(b)
    let totals = a.reduce((accumulator, current) => accumulator+(current * counter.val(current)), 0)
    console.log(`Part 2: ${totals}`)    
}

let stop = performance.now()

console.log(`Load took ${((load-start)/1000).toFixed(6)} msecs, calculation ${((stop-load)/1000).toFixed(6)} msecs`)
