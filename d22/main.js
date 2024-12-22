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

function mix(x, y) { return x ^ y}
function prune(x) { return x & 16777216 - 1}

// calculate the next secret
function nextSecret(secret) {
    secret = prune(mix(secret, secret << 6))
    secret = prune(mix(secret, secret >>> 5))
    secret = prune(mix(secret, secret << 11))
    return secret
}

// Actual problem solving starts here ===========================================================================

// Part 1 is just iterating the secret 2000 times and calculating the results  

if (tasks.includes(1)) {
    let totals = 0

    const iter = 2000

    console.log(`Doing ${iter} iterations...`)
    for (const sval of lines) {
        let s = parseInt(sval)
        for (let i = 0; i < iter; i++) {
            s = nextSecret(s)
        }
        console.log(`${sval}: ${s}`)
        // console.log(`After ${iter} iterations, result is ${s}`)
        totals += s
    } 

    console.log(`Part 1 results: ${totals}`)    
}

// Part 2 is using a lot of maps and sets
// Idea is sort of a "brute force"
//  - while iterating over aeach secret, keep track of the differences 
//    and their last value: for each first occurence of 4 subsequent differences, 
//    track the last value in a map
// - process all inital secrets this way, ending up with a lot of such maps
// - find out what sequences exist in any of the maps
// - iterate over them and calculate their values, keeping track of the maximum
if (tasks.includes(2)) {
    let totals = 0

    const iter = 2000

    // list of all secrets sequence values, i.e.
    // for every secret, contains a map that links 4-tuples in their secret 
    // sequence to their first value
    const secretSequenceValues = []

    for (const secretVal of lines) {

        let secret = parseInt(secretVal)
        let lastDigit = ((secret % 10) + 10 ) % 10


        // maps (a,b,c,d) to the value of its first occurence
        let sequenceValues = {}

        let sequenceDiffs = []
        for (let i = 0; i < iter; i++) {
            secret = nextSecret(secret)
            let thisDigit = ((secret % 10) + 10 ) % 10
            let diff = thisDigit-lastDigit
            sequenceDiffs.push(diff)
            if (i >= 3) {
                let key = sequenceDiffs.slice(i-3, i+1)
                if (!sequenceValues.hasOwnProperty(key)) {
                    sequenceValues[key] = thisDigit
                }
            } 
            lastDigit = thisDigit
        }
        console.log(`Calculating for val: ${secretVal} - ${Object.keys(sequenceValues).length} sequences`)
        
        // console.log(monkeyVals)
        secretSequenceValues.push(sequenceValues)
        // console.log(`After ${iter} iterations, result is ${s}`)
        totals += secret
    } 

    // secretSequenceValues contains all sequences and values for all secrets
    // now we need to build a set with unique sequences
    let allSequences = new Set()
    for (const ssv of secretSequenceValues) {
        Object.keys(ssv).forEach(a => allSequences.add(a))
    }
    //  This one is way tooo slow - why?
    //  let allSequences = new Set(secretSequenceValues.reduce((acc, ssv) => acc.concat(Object.keys(ssv)), []))
    console.log(`Need to inspect ${allSequences.size} sequences`)
    
    // last examine all secrets sequences values and identify the maximum
    let maxValue = -Infinity
    let maxSequence = null
    for (const seq of allSequences.values()) {
        let val = 0
        for (const ssv of secretSequenceValues) {
            if (ssv.hasOwnProperty(seq)) val += ssv[seq] 
        }
        if (val > maxValue) { maxValue = val; maxSequence = seq; }
    }

    console.log(`Part 2 results: ${maxValue} ${maxSequence}`)    
}

let stop = performance.now()

console.log(`Load took ${((load-start)/1000).toFixed(6)} msecs, calculation ${((stop-load)/1000).toFixed(6)} msecs`)
