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

// Part 1 I originally solved in a somewhat stupid way, but leave it here for documentary purposes
// I just created an array of all relevant "lines":
//  - all existing lines
//  - all lines made up of existing columns
//  - all lines made up of existing diagonals (of varying length!)
// Then I used regexp to search for occurence of "XMAS" as well as "SAMX"

if (tasks.includes(1)) {
    let all_lines = []

    // all lines
    for (const l of lines) {
        all_lines.push(l)
    }
    
    // all columns
    for (let j = 0; j < m; j++) {
        let b = []
        for (let i = 0; i < n; i++) {
            b.push(lines[i][j])
        }
        all_lines.push(b.join(""))    
    }
    
    // all diagonals
    for (let x = m-4; x > 0; x--) {
        let b = []
        let cnt = 0
        while (x + cnt < m) {
            b.push(lines[cnt][x+cnt])
            cnt += 1
        }
        all_lines.push(b.join(""))
    }
    for (let x = 3; x < m; x++) {
        let b = []
        let cnt = 0
        while (x - cnt >= 0) {
            b.push(lines[cnt][x-cnt])
            cnt += 1
        }
        all_lines.push(b.join(""))    
    }
    for (let y = 0; y < n-3; y++) {
        let b = []
        let cnt = 0
        while (y + cnt < n) {
            b.push(lines[y+cnt][cnt])
            cnt += 1
        }
        all_lines.push(b.join(""))    
    }
    for (let y = 1; y < n-3; y++) {
        let b = []
        let cnt = 0
        while (y + cnt < n) {
            b.push(lines[y+cnt][m-1-cnt])
            cnt += 1
        }
        all_lines.push(b.join(""))    
    }
    // console.log(`total lines: ${all_lines.length}`)
    
    let cnt = 0
    for (const line of all_lines) {
        let xmas = line.match(/XMAS/g)
        let samx = line.match(/SAMX/g)  
        cnt += (xmas == null ? 0 : xmas.length)
        cnt += (samx == null ? 0 : samx.length)
    }
    console.log(`Part 1: ${cnt} occurences`)    
}

// Part 2 I solved by iterating over the grid, searching for 'A' and
// then checking if there is "M S" around it in all relevant directions

if (tasks.includes(2)) {
    let indices = []
    for (let i = 1; i < n-1; i++) {
        for (let j = 1; j < m; j++) {
            if (lines[i][j] == 'A') {
                let tl = lines[i-1][j-1]   // top-left
                let tr = lines[i-1][j+1]   // top-right
                let bl = lines[i+1][j-1]   // bottom-left
                let br = lines[i+1][j+1]   // bottom-right
                if ( (tl == 'M' && br == 'S' || tl == 'S' && br == 'M') &&
                     (bl == 'M' && tr == 'S' || bl == 'S' && tr == 'M')) {
                    indices.push([i, j])
                }
    
            }
        }
    }
    console.log(`Part 2: ${indices.length} occurences`)    
}

let stop = performance.now()

console.log(`Load took ${((load-start)/1000).toFixed(6)} msecs, calculation ${((stop-load)/1000).toFixed(6)} msecs`)

