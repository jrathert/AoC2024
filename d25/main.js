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


let data = load_data(test_only)

const _items = data.trim().split('\n\n');

const locks = []
const keys = []
let width = 0
let height = 0
let fullLine

for (let idx = 0; idx < _items.length; idx++) {
    const lines = _items[idx].trim().split('\n')
    if (idx == 0) {
        width = lines[0].length
        height = lines.length
        console.log(`width: ${width}, height: ${height}`)
        fullLine = '#'.repeat(width)
    }

    let item = Array(width).fill(0)
    for (let i = 1; i < height; i++) {
        for (let j = 0; j < width; j++) {
            if (lines[i][j] != lines[i-1][j]) {
                item[j] = i-1
            }
        }
    }
    if (lines[0] == fullLine) {
        locks.push(item)
    } else {
        for (let j = 0; j < width; j++) {
            item[j] = (height-1) - item[j] -1
        }
        keys.push(item)
    }
}

console.log(`# of locks: ${locks.length}, # of keys: ${keys.length}`)


let load = performance.now()

// Actual problem solving starts here ===========================================================================

// Part 1 ...

function testKeyInLock(key, lock) {
    for (let j = 0; j < width; j++) {
        if (key[j] + lock[j] >= height-1) {
            return false
        }
    }
    return true
}

if (tasks.includes(1)) {
    let totals = 0
    for (const lock of locks) {
        for (const key of keys) {
            totals += testKeyInLock(key, lock) ? 1 : 0
        }
    }
    console.log(`Part 1 results: ${totals}`)    
}

// Part 2 ...

if (tasks.includes(2)) {
    let totals = 0
    console.log(`Part 2 results: ${totals}`)    
}

let stop = performance.now()

console.log(`Load took ${((load-start)/1000).toFixed(6)} msecs, calculation ${((stop-load)/1000).toFixed(6)} msecs`)
