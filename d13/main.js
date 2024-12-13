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

// Part 1 can be solved brute force (just using all combinations of #pressA and #pressB that are in total less than 100),
// but by reading it that for sure puts you in trouble for part 2. But looking at it, it is just some simple equation
// system - looking at the following:
//
// Button A: X+94, Y+34             a1 = 94, b1 = 34
// Button B: X+22, Y+67             a2 = 22, b2 = 67
// Prize: X=8400, Y=5400             x = 8400, y = 5400
//
// gives you after some calculation
//    pressesA = (x*b2 - y*a2)/(b2*a1 - a2*b1)
//    pressesB = (x - a1*pressesA)/a2
// Now, if pressesA and pressesB are Integers, there is a solution, otherwise not

// As the actual solving process for part 1 and 2 are exactly the same, except for adding the x, y 
// "conversion error" of 10000000000000, just one function is necessary

function solve(taskno) {
    let quiz = 0
    let numTokens = 0
    let cntSolutions = 0

    while (quiz * 4 < n+1) {

        // the regex catches both type of lines, and would also allo negative numbers...
        let re = /.*X[=]?([+-]?[0-9]+), Y[=]?([+-]?[0-9]+)/
        let [ a1, b1 ] = lines[quiz*4+0].match(re).slice(1, 3).map(Number)
        let [ a2, b2 ] = lines[quiz*4+1].match(re).slice(1, 3).map(Number)
        let [  x,  y ] = lines[quiz*4+2].match(re).slice(1, 3).map(Number)

        if (taskno == 2) {
            x += 10000000000000
            y += 10000000000000    
        }

        let pressesA = (x*b2 - y*a2)/(b2*a1 - a2*b1)
        let pressesB = (x - a1*pressesA)/a2

        // console.log(`Solution = ${pressesA},${pressesB}`)

        if (Number.isInteger(pressesA) && Number.isInteger(pressesB)) {
            numTokens += pressesA * 3 + pressesB * 1
            cntSolutions++
        }

        quiz += 1
    }
    
    console.log(`Part ${taskno}: fewest tokens ${numTokens} (${cntSolutions} solutions)`)   

}

// Part 1 just calls the solve() method

if (tasks.includes(1)) {
    solve(1)
}

// Part 2 just calls the solve() method

if (tasks.includes(2)) {
    solve(2)
}

let stop = performance.now()

console.log(`Load took ${((load-start)/1000).toFixed(6)} msecs, calculation ${((stop-load)/1000).toFixed(6)} msecs`)
