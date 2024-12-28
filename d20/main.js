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

// we need a grid today, very simple - later we will build a path in that grid
let grid = [] ;
for (const l of lines) {
    grid.push(l.split(''))
}

// find the position of a specifc element, defaults to S
function findPos(c= 'S') {
    for (let y = 1; y < n-1; y++) {
        for (let x = 1; x < m-1; x++) {
            if (grid[y][x] === c)
                return [x, y] 
        }
    }
    return null
}

function printGrid(g) {
    for (let y = 0; y < n; y++) {
        console.log(g[y].join(''))
    }
}


// assumption: there is exacly one field next on the path, find it
function step(x, y) {
    if (x > 1   && grid[y][x-1] !== '#') return [x-1, y]
    if (x < m-1 && grid[y][x+1] !== '#') return [x+1, y]
    if (y > 1   && grid[y-1][x] !== '#') return [x, y-1]
    if (y < n-1 && grid[y+1][x] !== '#') return [x, y+1]
    return null // should not happen
}

// Build the path. There is only one, so we use the grid to follow along. 
// Just make sure to not go back ;-)
function buildPath() {
    let [sx, sy] = findPos('S')
    let [ex, ey] = findPos('E')
    
    let x = sx
    let y = sy
    let path = [ [x, y] ]
    
    while (true) {
        grid[y][x] = '#'  // avoid coming here again
        let [nx, ny] = step(x, y)
        path.push([nx, ny])
        if (nx === ex && ny === ey)
            break
        x = nx
        y = ny
    }
    return path
}

// Manhattan distance
function dxy(x1, y1, x2, y2) {
    return Math.abs(x2-x1)+Math.abs(y2-y1)
}

// Actual problem solving starts here ===========================================================================

// build tha path, will be used in both solutions
let path = buildPath()

// this is the solution for both parts
// just iterate over all nodes in the path, comparing their distance
// as well as their manhattan distance - if the latter is less,
// then just cheat (if you are in the boundary of maxCheatLength)
function findSavings(maxCheatLength) {
    let allSavings = {}

    for (let i = 0; i < path.length; i++) {
        const [x1, y1] = path[i]
        for (let j = i+1; j < path.length; j++) {
            const [x2, y2] = path[j]
            const d = dxy(x1, y1, x2, y2)
            if (d <= maxCheatLength) {
                const pd = j-i    // path distance
                const s = pd-(d)
                if (s > 0) {
                    allSavings[s] = allSavings[s] + 1 || 1
                }
            }
        }
    }
    return allSavings
}

// Part 1 calls the above function with a max cheat length of 2

if (tasks.includes(1)) {
    let allSavings = findSavings(2)
    let totals = 0
    for (let k of Object.keys(allSavings).filter(a => a >= (test_only ? 0 : 100))) {
        let c = allSavings[k]
        if (test_only === true) {
            console.log(`There ${c === 1 ? "is" : "are"} ${c==1?"one":c} cheat${c==1?"":"s"} that save${c==1?"s":""} ${k} picoseconds.`)
        }
        totals += c
    }
    console.log(`Part 2 results: ${totals}`)    
}

// Part 2 calls the above function with a max cheat length of 20

if (tasks.includes(2)) {

    let allSavings = findSavings(20)
    let totals = 0
    for (let k of Object.keys(allSavings).filter(a => a >= (test_only ? 0 : 100))) {
        let c = allSavings[k]
        if (test_only === true) {
            console.log(`There ${c === 1 ? "is" : "are"} ${c==1?"one":c} cheat${c==1?"":"s"} that save${c==1?"s":""} ${k} picoseconds.`)
        }
        totals += c
    }
    console.log(`Part 2 results: ${totals}`)    
}

let stop = performance.now()

console.log(`Load took ${((load-start)/1000).toFixed(6)} msecs, calculation ${((stop-load)/1000).toFixed(6)} msecs`)
