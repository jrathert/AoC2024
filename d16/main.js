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

// we need a grid as well as a second copy that tracks which field were visited
// (by keeping track of the minimum cost for each field
let grid = [] ;
let visited = []
for (const l of lines) {
    grid.push(l.split(''))
    visited.push(Array(m).fill(Infinity))
}

function resetVisitied() {
    visited = []
    for (const l of lines) {
        visited.push(Array(m).fill(Infinity))
    }
}

let allSeats = {}
let minECost = Infinity

let load = performance.now()


// Actual problem solving starts here ===========================================================================

// find the position of a specifc element, defaults to S
function findPos(c= 'S') {
    for (let y = 1; y < n-1; y++) {
        for (let x = 1; x < m-1; x++) {
            if (grid[y][x] == c)
                return [x, y] 
        }
    }
    return null
}

// print steps, assuming allSeats[key] contains the relevant set 
// of seats
function calcSeats(doPrint = false) {
    let keys = Object.keys(allSeats).map(Number).sort(function (a, b) { return a-b }) 
    if (keys.length > 0) {
        let k = keys[0]
        let seats = allSeats[k]
        if (doPrint == true) {
            for (let y = 0; y < n; y++) {
                let line = []
                for (let x = 0; x < m; x++) {
                    const v = `${x},${y}`
                    line.push(seats.has(v) ? "O" : grid[y][x])
                }
                console.log(line.join(''))
            }    
        }    
        return seats.size
    }
    return 0
}


// list potential steps from field x, y, assuming you walk into direction dir
// and have currently costs of currCost
// there are basically three cases:
//   -> we reached the target and thus return an empty list
//   -> we have 1, 2 or even 3 options and return them in a list
//   -> we have no solution (as we are blocked) - in this case we return null  
function listSteps(x, y, dir, currCost) {

    // if we are at the finish, we do return null
    if (grid[y][x] == 'E') return null

    // I considered an optimization and only propose fields that have less or equal costs (see commented lines)
    // But this does not work: you might need to cross a path that was cheaper, but that you
    // meet at a later time with then the same price.
    let steps = []
    if (dir == '^' || dir == 'v') {
        let d = dir == '^' ? -1 : 1
        // if (grid[y+d][x] != '#' && currCost +    1 <= visited[y+d][x]) steps.push([x, y+d, dir, 1])
        // if (grid[y][x-1] != '#' && currCost + 1001 <= visited[y][x-1]) steps.push([x-1, y, '<', 1001])
        // if (grid[y][x+1] != '#' && currCost + 1001 <= visited[y][x+1]) steps.push([x+1, y, '>', 1001])
        if (grid[y+d][x] != '#') steps.push([x, y+d, dir, 1])
        if (grid[y][x-1] != '#') steps.push([x-1, y, '<', 1001])
        if (grid[y][x+1] != '#') steps.push([x+1, y, '>', 1001])
    }
    else if (dir == '>' || dir == '<') {
        let d = dir == '<' ? -1 : 1
        // if (grid[y][x+d] != '#' && currCost +    1 <= visited[y][x+d]) steps.push([x+d, y, dir, 1])    
        // if (grid[y-1][x] != '#' && currCost + 1001 <= visited[y-1][x]) steps.push([x, y-1, '^', 1001])
        // if (grid[y+1][x] != '#' && currCost + 1001 <= visited[y+1][x]) steps.push([x, y+1, 'v', 1001])    
        if (grid[y][x+d] != '#') steps.push([x+d, y, dir, 1])    
        if (grid[y-1][x] != '#') steps.push([x, y-1, '^', 1001])
        if (grid[y+1][x] != '#') steps.push([x, y+1, 'v', 1001])    
    }
    return steps
}


// continue a path at x, y with direction dir, assuming
// we have current cost of currCost at x, y. if path 
// is not null, we assume it is a list and keeps track of
// the positions we went (and will continue to go)
function continuePath(x, y, dir, currCost, path) {
    
    // if we need to track all paths, we need to visit equally costly
    // fields - otherwise we can enforce lower cost fields
    let maxAllowedCost = (path == null ? currCost + 1 : currCost) 
    if (visited[y][x] <  maxAllowedCost || currCost > minECost) {
        // it does not make sense to follow path, as 
        // - either we have been here with lower (or equal) costs or
        // - the current costs are already larger than the 
        //   minum costs until the end
        return  
    }

    // the current costs are the minimum to the current position (or equal to it - important for part 2)
    visited[y][x] = currCost

    
    if (path != null) {
        path.push(`${x},${y}`)
    }
    
    // steps will be the possible steps from this field
    //  - steps == null means: we reached the target 'E'
    //  - steps == []: We are stuck, no further way possible
    // Otherwise, steps contains a list of up to three possible
    // next steps
    let steps = listSteps(x, y, dir, currCost)
    while (steps != null && steps.length == 1) {
        // as long as steps contains exactly one element, we can just go forward
        let [nx, ny, nd, c] = steps[0]
        x = nx; y = ny
        currCost += c
        visited[y][x] = currCost
        if (path != null) {
            path.push(`${x},${y}`)
        }
        steps = listSteps(x, y, nd, currCost)
    }
    // now either steps is null - we reached the target 'E'
    // or contains 0 (nothing to do) or 2 or 3 elements - that need to be followed
    if (steps == null) { 
        // reached the target
        minECost = currCost < minECost ? currCost : minECost
        if (path != null) {
            // add the path to the set of keys that ended up here with same costs
            // console.log(`Adding path with cost ${c}) and ${path.length} elements`)
            let c = visited[y][x]
            let s = allSeats[c] || new Set()
            path.forEach((e) => s.add(e))
            allSeats[c] = s
        }
    }
    else { 
        // either empty or at a crossing 
        for (const s of steps) {
            let [nx, ny, nd, c] = s
            let p = (path == null) ? null : structuredClone(path)
            // console.log(`New path ${x},${y} '${nd}' ${nx},${ny}, (c: ${currCost+c}, vc: ${visited[ny][nx]})`)
            continuePath(nx, ny, nd, currCost+c, p)
        }
    }
}

// Part 1 ...

if (tasks.includes(1)) {

    let [sx, sy] = findPos('S')
    let [ex, ey] = findPos('E')
    console.log(`Start at ${sx},${sy} - end at ${ex},${ey}`)
    let dir = '>'
    continuePath(sx, sy, dir, 0, null)
    let cost = visited[ey][ex]
    console.log(`Part 1: results ${cost}`)    

}

// Part 2 ...

if (tasks.includes(2)) {
    resetVisitied()
    let [sx, sy] = findPos('S')
    let [ex, ey] = findPos('E')
    console.log(`Start at ${sx},${sy} - end at ${ex},${ey}`)
    let dir = '>'
    continuePath(sx, sy, dir, 0, [])
    let cost = visited[ey][ex]

    let numSeats = calcSeats()

    console.log(`Part 2: results ${cost} - ${numSeats}`)    
}

let stop = performance.now()

console.log(`Load took ${((load-start)/1000).toFixed(6)} msecs, calculation ${((stop-load)/1000).toFixed(6)} msecs`)
