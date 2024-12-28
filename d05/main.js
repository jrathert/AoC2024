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

// Part 1 was solved with kind of a hack: knowing all page ordering rules
// consist of two numbers < 100, I just make one bigger number from it
// (number1 * 100 + number2) and put them in a list of "rules"
// Then I do the same with the number pairs in the list of pages
// to be produced and check if they are all in the list of rules  

let erroneous = []   // indices of erroneous lines, reused in part 2

if (tasks.includes(1)) {


    // rules will be represented by numbers: aa|bb => aabb
    let rules = []
    let idx = 0

    while (lines[idx] !== "") {
        let [x, y] = lines[idx].split("|").map(Number)
        let val = x * 100 + y
        rules.push(val)
        idx++
    }
    // console.log(rules)
    idx++  // skip empty line between

    let totals = 0

    while (idx < lines.length) {
        let ordering = lines[idx].split(",").map(Number)
        let mid = ordering[Math.floor(ordering.length/2)]

        // for all pairs aa,bb check if aabb is in set of rules
        for (let j = 0; j < ordering.length-1; j++) {
            let val = ordering[j] * 100 + ordering[j+1]
            if (!rules.includes(val)) {
                // if not, do not count the mid value, add to erroneus and go to next line
                mid = 0
                erroneous.push(idx)
                break
            }
        }
        totals += mid
        idx++
    }
    console.log(`Part 1: result is ${totals}`)    
}

// Part 2 is leveraging the fact that the rules are unambiguous, i.e.
// there is exactly one rule for each pair, and the rules only contain
// the minimum number necessary. 

if (tasks.includes(2)) {

    if (!tasks.includes(1)) {
        console.log("You need to run task 1 first!")
        exit(1)
    }

    // this time, rules is a dictionary mapping numbers to all allowed successors in a list
    let rules = {
    }

    let idx = 0
    while (lines[idx] !== "") {
        let [x, y] = lines[idx].split("|").map(Number)
        if (x in rules) {
            rules[x].push(y)
        } 
        else {
            rules[x] = [ y ]
        }
        idx++
    }
    // console.log(rules)

    // iterate over all erroneous lines and sort candidates by
    // looking if any of them is contained in the rulset of the other

    let totals = 0
    for (const idx of erroneous) {
        let candidates = lines[idx].split(",").map(Number)
        let sorted = candidates.sort(function (a, b) { 
            if (rules[b] !== undefined && rules[b].includes(a)) {
                return 1
            }
            if (rules[a] !== undefined && rules[a].includes(b)) {
                return -1
            }
            console.log(`ERROR: No idea how to sort ${a} and ${b} - should not happen`)
            return 0
        })
        totals += sorted[Math.floor(sorted.length/2)]
    }

    console.log(`Part 2: results is ${totals}`)
}

let stop = performance.now()

console.log(`Load took ${((load-start)/1000).toFixed(6)} msecs, calculation ${((stop-load)/1000).toFixed(6)} msecs`)
