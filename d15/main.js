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

let grid = []
let i = 0
while (i < lines.length && lines[i].length > 0) {
    grid[i] = lines[i].split('')
    i++
}
let n = i
let m = lines[n-1].length
i++
let rules = []
while (i < lines.length && lines[i].length > 0) {
    rules.push(...lines[i].split(''))
    i++
}

let load = performance.now()

// Actual problem solving starts here ===========================================================================

// some helper functions used for both parts

// find the position of the robot in the grid
function findRobot() {
    for (let y = 0; y < n; y++) {
        for (let x = 0; x < m; x++) {
            if (grid[y][x] === '@')
                return [x, y] 
        }
    }
    return null
}

// print the grid
function printGrid() {
    for (let y = 0; y < n; y++) {
        console.log(grid[y].join(''))
    }
}

// calculate the GPS value by searching for character c in grid
// for part 1, c is 'O', for part 2 it is '['
function calcGpsSum(c = 'O') {
    let totals = 0
    for (let y = 1; y < n-1; y++) {
        for (let x = 1; x < m-1; x++) {
            if (grid[y][x] === c) {
                totals += 100 * y + x
            }
        }
    }
    return totals
}

// Part 1 helper functions

// push in a horizontal direction from pos to dir (= +/-1)
function pushHorizontal(pos, dir) {
    let [x, y] = pos
    let i = x + dir
    // go left/right until either blocked or a free space reached
    while (i >= 0 && i < m && grid[y][i] !== '.' && grid[y][i] !== '#') {
        i += dir;
    } 
    // if not blocked, move ahead (pushing boxes, if necessary)
    if (grid[y][i] === '.') {
        // move the robot
        grid[y][x] = '.'
        grid[y][x+dir] = '@'
        // if there were boxes, add one to the left/rightmost field
        if (i !== x+dir) grid[y][i] = 'O'
        return [x+dir, y]
    }
    return pos
}

// push in a horizontal direction from pos to dir (= +/-1)
function pushVertical(pos, dir) {
    let [x, y] = pos
    let i = y + dir
    // go up/down until either blocked or a free space reached
    while (i >= 0 && i < n && grid[i][x] !== '.' && grid[i][x] !== '#') {
        i += dir;
    } 
    // if not blocked, move ahead (pushing boxes, if necessary)
    if (grid[i][x] === '.') {
        // move the robot
        grid[y][x] = '.'
        grid[y+dir][x] = '@'
        // if there were boxes, add one to the top/bottom  field
        if (i !== y+dir) grid[i][x] = 'O'
        return [x, y+dir]
    }
    return pos
}

// Part 1 is solved by letting the robot push around until rules are done,
// using the simple helper functions above (pushHorizontal(), pushVertical())

if (tasks.includes(1)) {

    printGrid()
    let rpos = findRobot()
    console.log(`Grid size is ${n}x${m}, robot is a pos [${rpos[0]},${rpos[1]}], we have ${rules.length} rules`)

    let pos = findRobot()
    if (pos === null) {
        console.log("ERROR - cannot find robot")
        exit(0)
    }

    let cnt = 0
    for (const r of rules) {
        cnt++
        let npos = rpos
        if (r === '^' || r === 'v') {
            npos = pushVertical(npos, r === '^' ? -1 : 1)
        }
        else if (r === '>' || r === '<') {
            npos = pushHorizontal(npos, r === '<' ? -1 : 1)
        }
        else {
            console.log(`ERROR - unknown rule '${r}'`)
        }
        // console.log(`Push '${r}' [${rpos[0]},${rpos[1]}] -> [${npos[0]},${npos[1]}]`)
        // printGrid()
        rpos = npos
    }
    printGrid()

    console.log(`Part 1: results are ${calcGpsSum()}`)    
}

// Part 2 helper functions

// rebuild the grid for part 2
function transformGrid() {
    let newgrid = []
    for (let y = 0; y < n; y++) {
        newgrid[y] = []
        for (let x = 0; x < m; x++) {
            let c = grid[y][x]
            switch (c) {
                case '#': newgrid[y].push('#'); newgrid[y].push('#'); break;
                case 'O': newgrid[y].push('['); newgrid[y].push(']'); break;
                case '.': newgrid[y].push('.'); newgrid[y].push('.'); break;
                case '@': newgrid[y].push('@'); newgrid[y].push('.'); break;
                default: break;
            }
        }
    }
    m = 2*m
    grid = newgrid
}

// find the vertical neighboring boxes of pos in direction dir
// is needed when pushing vertically
function listVerticalNeighs(x, y, dir) {
    // pos is the left position of a box or the robot, dir(ection) is either -1 (go up) or 1 (go down)
    // returns a list of boxes that would be relevant in the direction, i.e.
    // it might contain 0, 1 or 2 boxes (their left index)
    // returns null if this position is blocked by a '#'
    let ret = []
    // let [x, y] = pos

    // there is a '#' in direction of pushing -> return null
    if (grid[y+dir][x] === '#' || (grid[y][x] !== '@' && grid[y+dir][x+1] === '#')) {
        return null
    }
    // there is the right edge of a box in direction of pushing -> push its left edge 
    if (grid[y+dir][x-1] === '[') {
        ret.push(x-1)
    }
    // there is the left edge of a box in direction of pushing -> push it 
    if (grid[y+dir][x] === '[') {
        ret.push(x)
    }
    // x is in fact the left edge of a box, and the right edge has a left edge in direction of pushing -> push it
    if (grid[y][x] !== '@' && grid[y+dir][x+1] === '[') {
        ret.push(x+1)
    }

    return ret
}

// find all vertical neighboring boxes of the x-positions in x_indices in row y and direction dir
// is needed when pushing vertically
function allVerticalNeighs(x_indices, y, dir) {
    // x_indices is a list of boxes (their left index) in row y, dir the direction
    // return an array of all boxes (i.e., their left edge) that are affected by pushing into dir
    // returns an empty array, if there are none, null if there is a blocker
    let allNeighs = new Set()
    for (const x of x_indices) {
        let neighs = listVerticalNeighs(x, y, dir)
        if (neighs === null) {
            // some box is blocked - whole row cannot be moved
            return null
        }
        if (neighs.length > 0) {
            neighs.forEach((elem) => allNeighs.add(elem))
        }
    }
    return [...allNeighs]
}

// push in a vertical direction from pos to dir (= +/-1)
function pushVertical2(pos, dir) {
    let [x, y] = pos
    let neighs = listVerticalNeighs(x, y, dir)
    let i = y

    let rows = [] // contains an array for each affected row with elements to be moved

    // going into direction, find affected boxes and add them to the rows array (for the index of the row)
    while (neighs !== null && neighs.length > 0 && i >= 0 && i < n) {
        i += dir
        rows[i] = neighs
        neighs = allVerticalNeighs(rows[i], i, dir)
    }
    // of neighs is null, there was a blocker, so we cannot move
    // if it is not null, it is empty, but "rows" now contains 
    // entries of all boxes in that row that we can move to dir
    if (neighs !== null) {
        // not blocked, process rows
        while (i !== y) {
            for (const c of rows[i]) {
                grid[i+dir][c] = '['; grid[i+dir][c+1] = ']'; 
                grid[i][c] = '.'; grid[i][c+1] = '.';
            }
            i -= dir
        }
        // last, move the robot
        grid[y+dir][x] = '@'; 
        grid[y][x] = '.'; 
        pos = [x, y+dir]
    }
    return pos
}

// push in a horizontal direction from pos to dir (= +/-1)
function pushHorizontal2(pos, dir) {
    let [x, y] = pos
    let i = x + dir

    // go left/right until either blocked or a free space reached
    while (i >= 0 && i < m && grid[y][i] !== '.' && grid[y][i] !== '#') {
        i += dir;
    } 
    // if not blocked, move ahead (pushing boxes, if necessary)
    if (grid[y][i] === '.') {
        // need to move every single column as they all change
        while (i !== x) {
            grid[y][i] = grid[y][i-dir]
            i -= dir
        }
        grid[y][x] = '.'
        return [x+dir, y]
    }
    return pos
}

// Part 2 is solved again by letting the robot push around until rules are done,
// using the all the functions above (pushHorizontal2(), pushVertical2())


if (tasks.includes(2)) {

    // need to adapt the grid
    transformGrid()
    printGrid()
    let rpos = findRobot()

    let cnt = 0
    for (const r of rules) {
        cnt++
        let npos = rpos
        if (r === '^' || r === 'v') {
            npos = pushVertical2(npos, r === '^' ? -1 : 1)
        }
        else if (r === '>' || r === '<') {
            npos = pushHorizontal2(npos, r === '<' ? -1 : 1)
        }
        else {
            console.log(`ERROR - unknown rule '${r}'`)
        }
        // console.log(`Push '${r}' [${rpos[0]},${rpos[1]}] -> [${npos[0]},${npos[1]}]`)
        // printGrid()
        rpos = npos
    }
    printGrid()

    console.log(`Part 2: results are ${calcGpsSum('[')}`)
}

let stop = performance.now()

console.log(`Load took ${((load-start)/1000).toFixed(6)} msecs, calculation ${((stop-load)/1000).toFixed(6)} msecs`)
