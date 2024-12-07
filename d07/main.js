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

// Part 1 I first tried to solve building up a tree containing all different results of each step. But this seemed
// to be bit of an overkill. I therefore decided to just iterate over the values and keep the last results in a list.
// (As results can only grow, I "optimized" by storing only those that are less or equal to the target)  
// After going through all values, I checked whether any of the last results (the leaves of my tree ;-) is equal
// to my target.
 
if (tasks.includes(1)) {
    
    let totals = 0
    let cnt = 0

    for (const line of lines) {
        let [ target, input ] = line.split(":")
        target = parseInt(target)
        let vals = input.trim().split(" ").map(Number)

        let last = [vals[0]]
        for (const v of vals.slice(1)) {
            let newlast = []
            for (const l of last) {
                let m = l * v
                if (m <= target) {
                    newlast.push(m)
                } 
                let a = l + v
                if (a <= target) {
                    newlast.push(a)
                }
            }
            last = newlast
        }
        if (last.includes(target)) {
            cnt += 1
            totals += target
        }    
    }
    console.log(`Part 1: ${cnt} of ${lines.length} equations match, adding up to ${totals}`)    
}

// Part 2 ist just a copy of part 1 with an additional operator. Everything else is the same

if (tasks.includes(2)) {

    let totals = 0
    let cnt = 0

    for (const line of lines) {
        let [ target, input ] = line.split(":")
        target = parseInt(target)
        let vals = input.trim().split(" ").map(Number)
    
        let last = [vals[0]]
        for (const v of vals.slice(1)) {
            let newlast = []
            for (const l of last) {
                let m = l * v
                if (m <= target) {
                    newlast.push(m)
                } 
                let a = l + v
                if (a <= target) {
                    newlast.push(a)
                }
                let c = parseInt("" + l + v)
                if (c <= target) {
                    newlast.push(c)
                }
            }
            last = newlast
        }
        if (last.includes(target)) {
            totals += target
            cnt += 1
        }    
    }
    console.log(`Part 2: ${cnt} of ${lines.length} equations match, adding up to ${totals}`)    
}

let stop = performance.now()

console.log(`Load took ${((load-start)/1000).toFixed(6)} msecs, calculation ${((stop-load)/1000).toFixed(6)} msecs`)
