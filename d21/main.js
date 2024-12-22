#!/usr/bin/env node

// Note: I am just learning JavaScript (not from "ground up", I know several languages like C, C++, Java, Python, ...),
// but more like how to work best with lists, dictionaires, etc., and getting "hands on experience"
// You will find a lot of boilerplate code here, and also some of my solutions might suffer from the fact that
// I am still learning. You have been warned... ;-)

import { dir } from 'node:console';
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


// Build keypads (one numeric, one directional)
// Keys of each key keypad will be the "from-to-paris", e.g. "3-7" would mean: go from 3 to 7
// Values will be list of potential moves (^, v, <, >) to get there. E.g, for "1-2" the list wil just contain
// one entry (">"), for others, they might be longer
// While not absolutely necessary, I create two different pads: the numeric keypad an the directional keypad
// (as the keys are different, could have been one keypad)
// The input file has been build manually
let movedata = readFileSync(import.meta.dirname + '/movements.txt', 'utf8').trim().split('\n\n')

let numpad = {}
for (let n of movedata[0].split('\n')) {
    let k = n.split(':')
    numpad[k[0]] = k[1].trim().split(' ')
}

let dirpad = {}
for (let p of movedata[1].split('\n')) {
    let k = p.split(':')
    dirpad[k[0]] = k[1].trim().split(' ')
}

// IMPORTANT NOTE on the above:
// Apparently, when looking at the movements, there is a difference 
// in the overall number of movements needed.
// E.g. consider the numeric keypad move from 3-7
//   - there are many options, including the two easiest 
//     ones, i.e.: <<^^ (two left, then two up) and ^^<< (two up, then two left)
//   - both will work, and looking at one indirection, both will lead to the same
//     result
//   - but in the second indirection, the result will be different: going up first and
//     then left results in a longer overall sequence!
//   - so, when doing "3-7", make sure to use "<<^^"!
// Same applies to other movements, and not only on the numeric keypad, but also
// on the directional keypads, e.g., in "v-A" you should do "^>", not ">^".
// I have not fully understood why that is the case 
// 
// The algorithms use the first entry in the list of possible movements, so make
// sure the input file is correct!
//
// I think to identify the proper movement could be sovled by an algorithm - but
// did not yet find time to look into it

// General helper function to get the numeric value of a code
// e.g., 029A => 29
function to_number(code) {
    return parseInt(code.slice(0, -1))
}

// In part 1 I simulated the actual movements. As turned out in part 2, there
// would have been a better way (part 2 also easily solves part 1, but more efficient)

// Returnes the necessary movements on pad to get from from to to, including
// the necessary "A" to make things happen, as string
function moveOnPad(from, to, pad) {
    if (from == to) return 'A'
    let key = `${from}-${to}`
    let movements = pad[key][0]
    return movements+'A'
}

// Return the movements to get from from to to on the numeric keypad as string
// considering num_indirects indirections
// from, to are considered to be items on the numpad
function moveOnNumpad(from, to, num_indirects=2) {

    // lets find out what needs to be pressed initially
    let dirpad_moves = moveOnPad(from, to, numpad)
    // console.log(`Moving numpad ${from}-${to}: [${dirpad_moves}]`)

    // now iterate over the number of indirects and "blow up" the 
    // moves on the initial directional keypad
    for (let i = 0; i < num_indirects; i++) {
        // let indent = ' '.repeat(2*(i+1))        // Useful for debugging
        let new_moves = ""
        let from = 'A'
        for (let k of dirpad_moves) {
            let to = k 
            let mvmnts = moveOnPad(from, to, dirpad)
            // console.log(`${indent}Moving on dirpad: ${from}-${to}: ${mvmnts}`)
            new_moves += mvmnts
            from = to
        }
        dirpad_moves = new_moves
    }
    return dirpad_moves
}

// process a whole code by iterating over the elements (chars/numbers) and moving
// ahead to the next one on the numeric keypad by simulating num_indirects 
// indirections and adding up all necessary movements (strings) in a string
function processCode(code, num_indirects=2) {
    let totals = ""
    let from = 'A'
    for (let c of code) {
        let to = c 
        let mvmnts = moveOnNumpad(from, to, num_indirects)
        totals += mvmnts
        from = to
    }
    return totals
}


// In part 2 I used a different approach and build a cache

// Do one indirection of the sequence on the defined pad and
// return the result as string
function indirect(sequence, pad) {
    let ret = ""
    let from = 'A'
    for (let k of sequence) {
        let to = k 
        let mvmnts = moveOnPad(from, to, pad)
        ret += mvmnts
        from = to
    }
    return ret
}

let load = performance.now()

// Actual problem solving starts here ===========================================================================

// Part 1 just simulates the 2 indirections: Read all codes successively and
// process them with two indirections
// The result is an array contain

if (tasks.includes(1)) {
    let totals = 0
    for (const code of lines) {
        // create the sequence for code using 2 indirections
        let sequence = processCode(code, 2)
        let val = to_number(code) * sequence.length
        console.log(`${code}: ${sequence} (${to_number(code)} * ${sequence.length} = ${val})`)
        totals += val
    }
    console.log(`Part 1 results: ${totals}`)    
}

// Part 2 was solved completely diferently
// Indirections works according on sequences of the form abcdA according to the distributive law:
//   ind(seq1 + seq2) = ind(seq1) + ind(sed2)
// So the idea of part 2 is: generate a cache/counter that contains as keys atomic sequences and 
// as values the number they occure in the last sequence
// 
// Initialize that cache  with the results of processing the inital code, splitting the 
// resulting sequence after each "A" and counting the occurences of each atomic sequence in the cache
// 
// Then, for each iteration 
//   - iterate over all elements in the cache
//       - read its last number of occurences
//       - process it and put the results in a new cache, multiplied by the last number of occurences
//   - replace the old cache with the new cache
// last cache will then contain all "atomic" in the last sequence as keys and their number of occurences as values 
// just build a sum of the muliplication of each atomic sequence length with their number of occurences
// and you are done

if (tasks.includes(2)) {
    
    const num_indirects = 25

    let totals = 0

    for (const code of lines) {

        let code_number = to_number(code)
        let cache = {}

        // initialize the cache by processing the code once 
        let init = indirect(code, numpad)
        // split result into atomic sequences
        let atoms = init.split("A").map(a => a+"A").slice(0, -1)
        for (const a of atoms) {
            cache[a] = cache[a] + 1 || 1
        }

        // now for each iteration update the cache according to the
        // algorithm sketched above 
        for (let i = 0; i < num_indirects; i++) {
            let new_cache = {}
            for (const k of Object.keys(cache).filter(a => cache[a] > 0)) {
                let numOccurences = cache[k]
                let newseq = indirect(k, dirpad)
                // split result into atomic sequences
                let atoms = newseq.split("A").map(a => a+"A").slice(0, -1)
                for (const a of atoms) {
                    new_cache[a] = new_cache[a] + numOccurences || numOccurences
                }
            }
            cache = new_cache
        }

        // the cache now contains all atomic sequences and their number of occurences
        // just need to sum up
        let cnt = Object.keys(cache).filter(a => cache[a] > 0).reduce((acc, k) => acc += (cache[k] * k.length), 0)

        console.log(`${code}: ${num_indirects} indirections require ${cnt} button presses (${code_number} * ${cnt} = ${cnt*code_number})`)
        
        totals += cnt*code_number    
    }

    console.log(`Part 2 results: ${totals}`)    
}

let stop = performance.now()

console.log(`Load took ${((load-start)/1000).toFixed(6)} msecs, calculation ${((stop-load)/1000).toFixed(6)} msecs`)
