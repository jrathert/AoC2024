#!/usr/bin/env node

// Note: I am just learning JavaScript (not from "ground up", I know several languages like C, C++, Java, Python, ...),
// but more like how to work best with lists, dictionaires, etc., and getting "hands on experience"
// You will find a lot of boilerplate code here, and also some of my solutions might suffer from the fact that
// I am still learning. You have been warned... ;-)

import { readFileSync } from 'node:fs';
import { exit } from 'node:process';

import { WeightedGraph } from './dijkstra.js'

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

// for whatever reason the gridsize is not part of the input file

let gridX = test_only ? 7 : 71
let gridY = test_only ? 7 : 71
let maxBytes = test_only ? 12 : 1024

// again a grid
let grid = []
for (let y = 0; y < gridY; y++) {
    grid[y] = Array(gridX).fill('.')
}

// print the grid
function printGrid() {
    for (let y = 0; y < gridY; y++) {
        console.log(grid[y].join(''))
    }
}

// geht neighbors (right and down)
function neigh(x, y) {
    let ret  = []
    if (x < gridX-1) ret.push([x+1, y])
    if (y < gridY-1) ret.push([x, y+1])
    return ret
}

// return a list of all neighbor indices
function allNeighs(x, y) {
    let ret  = []
    if (x < gridX-1) ret.push([x+1, y])
    if (y < gridY-1) ret.push([x, y+1])
    if (x > 0) ret.push([x-1, y])
    if (y > 0) ret.push([x, y-1])
    return ret
}

// drop some initial number of
function dropBytes(num) {
    let i = 0
    while (i < num && i < n) {
        let [x, y] = lines[i].split(',').map(Number)
        grid[y][x] = '#'
        i++
    }
}

// now build a graph that we will use in both parts

dropBytes(maxBytes)

let graph = new WeightedGraph()

for (let y = 0; y < gridY; y++) {
    for (let x = 0; x < gridY; x++) {
        if (grid[y][x] !== '#') {
            let neighs = neigh(x, y)
            let p1 = `${x},${y}`
            for (let n of neighs) {
                let [x1, y1] = n
                if (grid[y1][x1] !== '#') {
                    let p2 = `${x1},${y1}`
                    graph.addEdge(p1, p2)
                }
            }    
        }
    }
}

// Actual problem solving starts here ===========================================================================

// Part 1 is just a simple Dijkstra in the initial grid

if (tasks.includes(1)) {

    let start = `${0},${0}`
    let end = `${gridX-1},${gridY-1}`
    let path = graph.dijkstra(start, end)
    console.log(`Part 1 results: ${path.length-1}`)    
}

// Part 2 is - sorry for that - brute force: for every byte that is dropped
// remove all edges from the graph and do disjtra again. Might take some
// time, but lead to the result

if (tasks.includes(2)) {

    let i = maxBytes
    while (i < n) {
        let [x, y] = lines[i].split(',').map(Number)
        grid[y][x] = '#'
        let p1 = `${x},${y}`

        let neighs = allNeighs(x, y)
        for (let n of neighs) {
            let [x1, y1] = n
            if (grid[y1][x1] !== '#') {
                let p2 = `${x1},${y1}`
                graph.removeEdge(p1, p2)
            }
        }    

        let start = `${0},${0}`
        let end = `${gridX-1},${gridY-1}`
        let path = graph.dijkstra(start, end)
        if (path.length-1 === 0) {
            console.log(`Part 2 result = ${x},${y}`)
            break
        }
        i++
    }
}

let stop = performance.now()

console.log(`Load took ${((load-start)/1000).toFixed(6)} msecs, calculation ${((stop-load)/1000).toFixed(6)} msecs`)
