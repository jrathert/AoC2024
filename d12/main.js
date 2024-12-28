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

// Part 1 was solved together with part 2 this time, as we just traverse the grid (recursively) and 
// for each field count number of borders (i.e. fences) plus the number of corners (which gives us the number of 
// directions - see below). We also track the areas and their size and store respective numbers (of fences and corners) 
// in a Counter to last fetch the total price

// So what is a "corner"?
// Every field has neighbors and might have fences, but also corners. A corner is counted if there is either an "inbound"
// corner or an "outbound" corner made by fences. 
// Eg., in below example, the first A in line 3 has one corner top-left, as well as the thris A in line 3, also top-left. 
// They can be identified by looking at the neighbor elements in the direction of the corner. 
// If they are both different from A, it is a inbound corner (first A in row 3, both neighbors are b and c), or 
// if they are both the same as A, but the diagonal element is not, then it is an "outbound corner" (third A in row 3,
// both neighbors are A, but the diagonal is d)
// The sum of these corners give the number of directions.
// 
//  1  a  c d|A  
//  2    +-+-+
//  3  b |A A A
//  4    +
//  5    |A A
//
// Note: When looking at the neighbors or diagonals, you might be out-of-bounds. For the algorithm to work
// we stll deliver some otherwise unused value.

function oob(x, y) {
    return (x < 0 || x >= n || y < 0 || y >= m)
}

function getLineElem(x, y, def='#') {
    if (oob(x, y))
        return def
    return lines[x][y]
}

function createVisitMap() {
    let visited = []
    for (let i = 0; i < n; i++) {
        visited[i] = Array(m).fill('.')
    }
    return visited
}

function findUnvisited(visitMap) {
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < m; j++) {
            if (visitMap[i][j] === '.') {
                return [i, j]
            }
        }        
    }
    return [-1, -1]
}

function cntBorders(pos) {
    const [x, y] = pos
    const c = lines[x][y]
    let ret = 0
    if (x === 0 || lines[x-1][y] !== c) ret++
    if (x === n-1 || lines[x+1][y] !== c) ret++
    if (y === 0 || lines[x][y-1] !== c) ret++
    if (y === m-1 || lines[x][y+1] !== c) ret++
    // console.log(`borders: ${x},${y} '${c}' -> ${ret}`)
    return ret
}


function cntCorners(pos) {
    const [x, y] = pos
    const c = lines[x][y]
    let ret = 0
    let t = getLineElem(x-1, y)
    let b = getLineElem(x+1, y)
    let l = getLineElem(x, y-1)
    let r = getLineElem(x, y+1)

    // top-left 
    if ((t !== c && l !== c) || (t === c && l === c && getLineElem(x-1, y-1) !== c)) {
        ret++
    }
    // top-right
    if ((t !== c && r !== c) || (t === c && r === c && getLineElem(x-1, y+1) !== c)) {
        ret++
    }
    // bottom-left
    if ((b !== c && l !== c) || (b === c && l === c && getLineElem(x+1, y-1) !== c)) {
        ret++
    }
    // bottom-right
    if ((b !== c && r !== c) || (b === c && r === c && getLineElem(x+1, y+1) !== c)) {
        ret++
    }
    // console.log(`corners: ${x},${y} '${c}' -> ${ret}`)
    return ret
}

class Counter {
    constructor() {
        this.dict  = {}
    }
    addOne(key) {
        if (key in this.dict) {
            this.dict[key].cnt += 1
        }
        else {
            this.dict[key] = { cnt: 1, borders: 0, corners: 0 }
        }
    }
    setValues(key, bc, cc) {
        this.dict[key].borders = bc
        this.dict[key].corners = cc
    }
}
let counter = new Counter()

function visit(visitMap, pos, c, k) {
    let [x, y] = pos
    let bc = 0  // border count
    let cc = 0  // corner count
    if (!(oob(x, y)) && lines[x][y] === c && visitMap[x][y] === '.') {
        visitMap[x][y] = c    
        counter.addOne(k)
        bc = cntBorders([x, y])
        cc = cntCorners([x, y])
        // console.log(`track: ${x},${y} -> ${k}, bc: ${bc}, cc: ${cc}`)
        let r
        r = visit(visitMap, [x-1, y], c, k); bc += r[0]; cc += r[1]   // up
        r = visit(visitMap, [x+1, y], c, k); bc += r[0]; cc += r[1]   // down
        r = visit(visitMap, [x, y-1], c, k); bc += r[0]; cc += r[1]   // left
        r = visit(visitMap, [x, y+1], c, k); bc += r[0]; cc += r[1]   // right
    }
    return [ bc, cc ]
}

if (tasks.includes(1) || tasks.includes(2)) {

    let visitMap = createVisitMap()

    while (true) {
        let [x, y] = findUnvisited(visitMap)
        if (x === -1) {
            break
        }
        const c = lines[x][y]
        const k = `${c}:${x},${y}`

        let [ bc, cc ] = visit(visitMap, [x, y], c, k)
        counter.setValues(k, bc, cc)
    }

    let cntAreas = 0
    let price_fences = 0
    let price_directions = 0
    for (let k in counter.dict) {
        let { cnt: c, borders: bc, corners: cc } = counter.dict[k]
        cntAreas++
        price_fences += c*bc
        price_directions += c*cc
    }

    console.log(`Part 1/2 results: ${cntAreas} areas, price 1: ${price_fences}, price 2: ${price_directions}`)    
}

let stop = performance.now()

console.log(`Load took ${((load-start)/1000).toFixed(6)} msecs, calculation ${((stop-load)/1000).toFixed(6)} msecs`)
