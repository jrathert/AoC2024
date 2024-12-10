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

// prepare a number grid from the lines, as we need to compare them often and calculate
let grid = []
for (const l of lines) {
    grid.push(l.split('').map( (x) => { if (x != '.') return parseInt(x); else return -1; } ))
} 

let load = performance.now()

// Actual problem solving starts here ===========================================================================

// return all valid neighbors of (i, j)
function neighbors(i, j) {
    let v = grid[i][j]
    let ret = []
    if (i > 0    && grid[i-1][j] == v+1) { ret.push([i-1, j]) }
    if (i < n-1  && grid[i+1][j] == v+1) { ret.push([i+1, j]) }
    if (j > 0    && grid[i][j-1] == v+1) { ret.push([i, j-1]) }
    if (j < m-1  && grid[i][j+1] == v+1) { ret.push([i, j+1]) }
    return ret
}

// there is only once function to solve the two parts, depending on the task number
// - for the first part, the algorithm maintains one single set of visited positions, to
//   ensure you never visit a position twice
// - for the second part, there is one set for each path, to ensure that for each path
//   you never visit a position twice
function solve(task) {
    let num_trails = 0
    
    // iterate over all positions in the grid and start a trail if the value is 0
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < m; j++) {

            if (grid[i][j] == 0) {

                let to_visit = [{ p: [i, j], s: new Set() }]

                while (to_visit.length > 0) {
                    let { p: [x, y], s: visited } = to_visit.pop()
                    let neigh = neighbors(x, y)
                    for (const p of neigh) {
                        let s = `${p[0]},${p[1]}`
                        if (!visited.has(s)) {
                            visited.add(s)
                            if (grid[p[0]][p[1]] == 9) {
                                num_trails += 1          
                            } 
                            else {
                                // this is the only line where the two parts differ
                                to_visit.push({ p: p, s: (task == 1 ? visited : new Set(visited)) })
                            } 
                        }  
                    }
                }
            }
        }
    }
    return num_trails
}

// Part 1: Search all paths and keep track of all visited positions

if (tasks.includes(1)) {
    let num_trails = solve(1)
    console.log(`Part 1: ${num_trails} trails`)    
}

// Part 2: Search all paths and keep track of visited positions per path

if (tasks.includes(2)) {
    let num_trails = solve(2)
    console.log(`Part 2: ${num_trails} trails`)    
}

let stop = performance.now()

console.log(`Load took ${((load-start)/1000).toFixed(6)} msecs, calculation ${((stop-load)/1000).toFixed(6)} msecs`)
