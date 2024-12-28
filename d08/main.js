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

// find all antennas in the grid and return as dictionary of lists (positions)
function findAntennas() {
    let antennas = {}
    let antenna_cnt = 0
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < m; j++) {
            const c = lines[i][j]
            if (c !== '.' && c !== '#') {
                antenna_cnt +=1
                if (c in antennas) {
                    antennas[c].push([i, j])
                }
                else {
                    antennas[c] = [[i, j]]
                }
            }
        }        
    }
    // consoloe.log(anntenna_cnt)
    // console.log(antennas)
    return antennas
}

// check if a position is out of bounds
function oob(pos) {
    return (pos[0] < 0 || pos[0] >= n || pos[1] < 0 || pos[1] >= m)
}

// for part 1: find max 2 antinodes of 2 positions
function antinodes(pos1, pos2) {

    // ensure x1 is smaller or equal x2 - not really necessary the way the
    // grid is processed later, but to be a bit generic... ;-)
    if (pos1[0] > pos2[0]) {
        [ pos1, pos2 ] = [ pos2, pos1 ]
    }
    const xdiff = pos2[0]-pos1[0]
    const ydiff = pos2[1]-pos1[1]

    // identify candidates (may be out of bounds!)
    const c1 = [ pos1[0]-xdiff, pos1[1]-ydiff ]
    const c2 = [ pos2[0]+xdiff, pos2[1]+ydiff ]

    let ret = []
    if (!oob(c1)) { ret.push(c1) }
    if (!oob(c2)) { ret.push(c2) }
    return ret
}

// for part 2: find all antinodes of 2 positions, incl. the positions themselves
function antinodes_all(pos1, pos2) {

    // ensure x1 is smaller or equal x2 - not really necessary the way the
    // grid is processed later, but to be a bit generic... ;-)
    if (pos1[0] > pos2[0]) {
        [ pos1, pos2 ] = [ pos2, pos1 ]
    }
    const xdiff = pos2[0]-pos1[0]
    const ydiff = pos2[1]-pos1[1]

    let ret = [ ]
    // start with the first position and go "back" until oob
    let x = pos1[0]
    let y = pos1[1]
    while (!oob([x, y])) {
        ret.push([x, y])
        x = x-xdiff
        y = y-ydiff
    }
    // start with the second position and go "forward" until oob
    x = pos2[0]
    y = pos2[1]
    while (!oob([x, y])) {
        ret.push([x, y])
        x = x+xdiff
        y = y+ydiff
    }

    return ret
}

// return the number of unique values in positions (an array of 2-int arrays)
function countUnique(positions) {
    // quite a hack to determine unique elements in positions
    // as both, x and y are < 100, we can just calculate 
    // a number and use them in a Set to dertermine unique positions
    let s = new Set()
    for (const p of positions) {
        s.add(p[0] * 100 + p[1])
    }
    // could also recreate the list by: [...s].map(t => [Math.floor(t/100), t%100]) - but we only need the number
    return s.size
}

// determine the antinodes, using the provided function
// to find antinodes for a pair of antennas
// - first find the antennas
// - iterate over all relevant pairs and find respective antinodes, using
//   the provided function
// - last, create a unique list of antinodes from it
function determineAntinodes(antinode_func) {
    let antennas = findAntennas()
    let anodes = []
    for (const [key, val] of Object.entries(antennas)) {
        for (let i = 0; i < val.length-1; i++) {
            for (let j = i+1; j < val.length; j++) {
                anodes.push(...antinode_func(val[i], val[j]))
            }
        }
    }
    return countUnique(anodes)
}

// Part 1: Use the simple version

if (tasks.includes(1)) {
    let cnt = determineAntinodes(antinodes)
    console.log(`Part 1: ${cnt} antinodes`)    
}

// Part 2: Use the more complex version

if (tasks.includes(2)) {
    let cnt = determineAntinodes(antinodes_all)
    console.log(`Part 2: ${cnt} antinodes`)    
}

let stop = performance.now()

console.log(`Load took ${((load-start)/1000).toFixed(6)} msecs, calculation ${((stop-load)/1000).toFixed(6)} msecs`)
