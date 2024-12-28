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


let maxTowelLen = 0
const towels = {}
for (const t of lines[0].split(', ')) {
    towels[t] = 1
    maxTowelLen = (maxTowelLen < t.length) ? t.length : maxTowelLen
} 

let load = performance.now()

// Actual problem solving starts here ===========================================================================

let cache = {
    // contains all "remaining patterns" that are feasible
}

// try to continue the design with the available towels
// depending on the stop_at_first parameter:
//   - traveres the whole tree and return the full number of options
//   - traverse the tree until you find some solution - return 1 or 0
// the magic about this is using the cache - otherwise, traversing the tree
// will not work
function layout(design, stop_at_first) {

    // console.log(`$Checking '${design}`)
    if (design in cache) {
        return cache[design]
    }

    let subdesigns = []
    let count = 0

    // for (let i = Math.max(maxTowelLen,design.length); i >= 0; i--) {
    for (let i = 0; i < maxTowelLen && i < design.length; i++) {
        const d = design.slice(0,i+1)
        if (d in towels) {
            if (d === design) {
                count += 1
                if (stop_at_first === true) {
                    cache[design] = 1
                    return 1
                }
            } else {
                // for performance reasons, we do not immediately consider subtress (="subdesigns"), but collect 
                // them first (as for stop_at_first === true we only need to dive deeper if we do not
                // find a solution on this level)
                subdesigns.push(design.slice(d.length))
            }
        }
    }
    // now process all subdesigns
    for (let s of subdesigns) {
        count += layout(s, stop_at_first)
        if (stop_at_first === true && count > 0) {
            cache[design] = 1
            return 1
        }
    }
    cache[design] = count
    return count
}


// Part 1: starting with the full design, try to build it from the 
// towels until a solution is found (stop_at_first === true)
if (tasks.includes(1)) {
    let totals = 0
    let stop_at_first = true
    for (let i = 2; i < n; i++) {
        cache = {} 
        let towel = lines[i]
        let ret  = layout(towel, stop_at_first)
        totals += ret
    }
    console.log(`Part 1: results: ${totals}`)    
}

// Part 2: starting with the full design, try to build all solution from the 
// towels (stop_at_first === true)
if (tasks.includes(1)) {

    let totals = 0
    let stop_at_first = false
    for (let i = 2; i < n; i++) {
        cache = {}
        let towel = lines[i]
        let ret = layout(towel, stop_at_first)
        totals += ret 
    }
    console.log(`Part 2: results: ${totals}`)    
}

let stop = performance.now()

console.log(`Load took ${((load-start)/1000).toFixed(6)} msecs, calculation ${((stop-load)/1000).toFixed(6)} msecs`)
