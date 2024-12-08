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

// I use a grid and need to keep track of directions, steps, turning, 
// reading a specific postion, running out of bounds, etc

const NORTH = 1
const EAST = 2
const SOUTH = 4
const WEST = 8

// give the next position in the given direction
function doStep(pos, dir) { 
    if (dir == NORTH) return [ pos[0]-1, pos[1] ]
    else if (dir == EAST) return [ pos[0], pos[1]+1 ]
    else if (dir == SOUTH) return [ pos[0]+1, pos[1] ]
    else if (dir == WEST) return [ pos[0], pos[1]-1 ]
    else return pos
}

// change the direction by turning right
function turnRight(dir) {
    if (dir == NORTH) return EAST
    else if (dir == EAST) return SOUTH
    else if (dir == SOUTH) return WEST
    else if (dir == WEST) return NORTH
}

// provide the grid-item at a postion
function at(pos) {
    return lines[pos[0]][pos[1]]
}

// check if a position is out of bounds
function oob(pos) {
    return (pos[0] < 0 || pos[0] >= n || pos[1] < 0 || pos[1] >= m)
}

// replace the character at the given position in the grid
// warning: super inefficient
function replaceAt(pos, ch) {
    const line = lines[pos[0]]
    let newLine = line.substring(0, pos[1]) + ch + line.substring(pos[1]+1) 
    lines[pos[0]] = newLine
}

// find the guard in the grid
function findGuard() {
    for (let r = 0; r < n; r++) {
        let c = lines[r].indexOf('^')
        if (c > -1) {
            return [r, c]
        }
    }
    return null
}

// Part 1: Just follow along the track of the guard and mark visited fields with an 'X'
// (which is super inefficient as I do a lot of substring-concatenation...), counting
// the fields when visiting them first

// need to find and save the guards initial position, as we overwrite it in
// part 1 and need it in part 2
let guardPos = findGuard() 

if (tasks.includes(1)) {

    let pos = guardPos
    let dir = NORTH

    let steps = 0
    let turns = 0
    let distinct = 1

    while (! oob(pos)) {
        
        // mark current position as visited and determine new position
        replaceAt(pos, 'X')
        let newPos = doStep(pos, dir)

        // if new position is out of bounds, we are done with this last step
        if (oob(newPos)) {
            steps += 1
            break
        }

        // else check the value of the new position and either take a step or
        // turn right
        let c = at(newPos) 
        if (c == '.' || c == '^' || c == 'X') {
            steps += 1
            pos = newPos
            if (c != 'X') distinct += 1
        } 
        else if (c == '#') {
            dir = turnRight(dir)
            turns += 1
        }
    }
    console.log(`Part 1: ${steps} steps, ${turns} turns, ${distinct} disctinct fields`)
}

// Part 2 is ugly. 
// As I did not (yet) find a smart way to solve it, I just do brute-force:
// Iterate over all grid items, and if they are not a '#' or the guards starting position, add an "obstacle"
// and check whether you run into a circle - running more or less the same algorithm than done in part 1
// Can heavily be improved, as the circle detection is rather stupid...

if (tasks.includes(2)) {
    if (!tasks.includes(1)) {
        console.log("You need to run part 1 before, as we leverage its results in part 2")
        exit(1)
    }
    // need to save the lines that were processed in part 1 and now contain
    // an 'X' on the visited positions
    let orglines = structuredClone(lines)

    // iterate over all positions in the grid - if it has been visited
    // check if putting an obstacle there would result in a circle
    let obstacles = []
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < m; j++) {

            lines = structuredClone(orglines)
            let chkPos = [i, j]
            let cc = at(chkPos)
            if (cc == '#' || cc == '^' || cc == '.')
                continue  // has not been visited, ignore

            replaceAt(chkPos, '#')
            
            // now basically run the alorithm from part 1 again and just
            // determine if it is a loop by looking at the number of steps
            // (very inefficient circle detection...!)
            let pos = guardPos
            let dir = NORTH
        
            let steps = 0
        
            while (! oob(pos)) {
                let newPos = doStep(pos, dir)
                if (oob(newPos)) {
                    steps += 1
                    break
                }
                let c = at(newPos) 
                if (c == '.' || c == '^' || c == 'X') {
                    steps += 1
                    pos = newPos
                    if (steps > m * n) {  // must be in loop - TODO: IMPROVE LOOP CHECK!
                        obstacles.push(chkPos)
                        break    
                    }
                } 
                else if (c == '#') {
                    dir = turnRight(dir)
                }
            }                    
        }
    }
    // console.log(obstacles)
    console.log(`Part 2: ${obstacles.length} obstacles`)    
}

let stop = performance.now()

console.log(`Load took ${((load-start)/1000).toFixed(6)} msecs, calculation ${((stop-load)/1000).toFixed(6)} msecs`)
