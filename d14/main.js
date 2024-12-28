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

// for whatever reason the gridsize is not part of the input file
let gridX = test_only ? 11 : 101
let gridY = test_only ? 7 : 103

// a robot has a number, a position (that changes with each step) and a velicity (that does not change)
class Robot {
    constructor(num, pos, velocity) {
        this.num = num
        this.pos = pos
        this.velocity = velocity
    }
    // take 1 (or more) steps
    step(cnt = 1) {
        this.pos.x = (((this.pos.x + cnt * this.velocity.x) % gridX ) + gridX ) % gridX
        this.pos.y = (((this.pos.y + cnt * this.velocity.y) % gridY ) + gridY ) % gridY
    }
    // get the quadrant (top-left: 1, bottom-left: 2, top-right: 3, bottom-right: 4)
    getQuadrant() {
        const xborder = Math.floor(gridX / 2)
        const yborder = Math.floor(gridY / 2)
        if (this.pos.x < xborder) {
            if (this.pos.y < yborder) {
                return 1
            } else if (this.pos.y > yborder) {
                return 2
            }
        } else if (this.pos.x > xborder) {
            if (this.pos.y < yborder) {
                return 3
            } else if (this.pos.y > yborder) {
                return 4
            }
        }
        return 0
    }
    print() {
        console.log(`R(${this.num}): [${this.pos.x},${this.pos.y}] (${this.velocity.x},${this.velocity.y}) -> ${this.getQuadrant()}`)
    }
}

function loadRobots() {
    let re = /p=(\d+),(\d+) v=(-?\d+),(-?\d+)/
    let robots = []
    let num = 0
    for (const line of lines) {
        let [posX, posY, velX, velY] = line.match(re).slice(1,5).map(Number)
        let r = new Robot(num++, {x: posX, y:posY},{x: velX, y: velY})
        robots.push(r)
    }
    console.log(`Loaded ${robots.length} robots`)
    return robots
}

// Part 1 is easy - just let every robot take 100 steps and 
// then get its quadrant, count them up and do the math

if (tasks.includes(1)) {
    let robots = loadRobots()

    let qcnt = [0, 0, 0, 0, 0]
    for (let r of robots) {
        r.step(100)
        qcnt[r.getQuadrant()]++
    }
    console.log(qcnt.slice(1))
    let safety_factor = qcnt.slice(1).reduce((acc, val) => acc * val, 1)
    console.log(`Part 1: safety factor of ${safety_factor} `)
}

// Part 2 is more difficult - one needs to review the actual grid that
// is formed by the robots, so there are functions to build and print it out

function buildGrid(robots, numsteps = 0) {
    let grid = {}
    for (const r of robots) {
        if (numsteps > 0) r.step(numsteps)
        const k = `${r.pos.x},${r.pos.y}` 
        let v = (k in grid) ? grid[k]+1 : 1 
        grid[k] = v
    }
    return grid
}
function printGrid(grid) {
    for (let j = 0; j < gridY; j++) {
        let line = []
        for (let i = 0; i < gridX; i++) {
            let k = `${i},${j}`
            line.push(k in grid ? '#' : '.')
        }
        console.log(line.join(''))
    }
}


function variant00() {
    // assumption: if there is an X-mas tree, we hope it is
    // not centered and therefore there is at least one
    // quadrant where there are less than 1/12 of the robots
    // approach is to go step by step (at most gridX*gridY, as 
    // this is where we cycle) and print out all grids that 
    // fullfill the prerequisite
    // You then need to check the output VISUALLY

    let robots = loadRobots()
    let step = 0
    let grid = {}
    while (step < gridX*gridY) {
        step++

        let qcnt = [0, 0, 0, 0, 0]
        grid = {}
        for (let r of robots) {
            r.step(1)
            qcnt[r.getQuadrant()]++
            const k = `${r.pos.x},${r.pos.y}` 
            grid[k] = grid[k] + 1 || 1
        }
        let q = qcnt.slice(1)
        let m = Math.min(...q)
        if (m < robots.length/12) {
            console.log(`=== After step: ${step} (min quadrant has ${m} elements) ====================`)
            printGrid(grid)
        }
    }
}

function variant01() {
    // assumption: X-mas tree if visible if and only if all
    // robots are on a different place in the grid

    let robots = loadRobots()
    let step = 0
    let grid = {}
    let found = false
    while (!found && step < gridX*gridY) {
        step++
        grid = {}
        for (let r of robots) {
            r.step(1)
            const k = `${r.pos.x},${r.pos.y}` 
            grid[k] = grid[k] + 1 || 1
        }
        if (Object.keys(grid).length === robots.length) {
            found = true
            break
        }
    }
    if (found) {
        console.log(`Variant 1: ${step} steps`)
        printGrid(grid)
    }
}

function variant02a() {
    // assumption: find lines in the grid
    // every x-mas tree would have a horizontal line with at 
    // least gridX/5 robots IN A ROW, based on a string representation
    let robots = loadRobots()
    let step = 0
    let grid = {}
    let pattern = Array(Math.floor(gridX/5)).fill('#').join('')
    let found = false
    while (!found && step < gridX*gridY) {
        step++
        // console.log(step)
        grid = {}
        for (let r of robots) {
            r.step(1)
            const k = `${r.pos.x},${r.pos.y}` 
            grid[k] = grid[k] + 1 || 1
        }
        for (let j = 0; j < gridY; j++) {
            let line = []
            for (let i = 0; i < gridX; i++) {
                let k = `${i},${j}`
                line.push(k in grid ? '#' : '.')
            }
            let l = line.join('')
            if (l.includes(pattern)) {
                found = true
                break
            }
        } 
    }
    if (found) {
        console.log(`Variant 2a: ${step} steps`)
        printGrid(grid)
    }
}

function variant02b() {
    // assumption: find lines in the grid
    // every x-mas tree would have a horizontal line with at 
    // least gridX/5 robots IN A ROW, based on counting subsequent robots
    let robots = loadRobots()
    let step = 0
    let grid = {}
    let found = false
    while (!found && step < gridX*gridY) {
        step++
        grid = {}
        for (let r of robots) {
            r.step(1)
            const k = `${r.pos.x},${r.pos.y}` 
            grid[k] = grid[k] + 1 || 1
        }
        for (let j = 0; j < gridY; j++) {
            let subsequent = 0
            let last = -99
            let maxSubsequent = -1
            for (let i = 0; i < gridX; i++) {
                let k = `${i},${j}`
                if (k in grid) {
                    if (last === i-1) {
                        subsequent++
                        if (subsequent > maxSubsequent) maxSubsequent = subsequent
                    } else {
                        subsequent = 1
                    }
                    last = i
                } else {
                    last = -99
                }
                if (maxSubsequent >= gridX/5) {
                    found = true
                    break
                }
            }
            if (found) break
        } 
    }
    if (found) {
        console.log(`Variant 2b: ${step} steps`)
        printGrid(grid)
    }
}

function variant03() {
    // calculate the variance of x- an y-positions mafter each step, and track their average
    // once you find a variance that differ bx more than 20%, you
    // may have found the tree
    let robots = loadRobots()
    let step = 0
    let found = false
    let avg_variantX = 0 
    let avg_variantY = 0

    while (!found && step < gridX*gridY) {
        step++
        let variances = []
        let xvals = []
        let yvals = []
        for (let r of robots) {
            r.step(1)
            xvals.push(r.pos.x)
            yvals.push(r.pos.y)
        }
        let meanX = xvals.reduce((acc, val) => acc += val, 0)/xvals.length
        let variaX = Math.sqrt(
            xvals.reduce( (acc, val) => acc.concat((val-meanX)**2), []).reduce((acc, val) => acc += val, 0))
        const frac = 0.8
        let candCnt = 0
        if (variaX/avg_variantX < frac ) {
            candCnt++
            let meanY = yvals.reduce((acc, val) => acc += val, 0)/yvals.length
            let variaY = Math.sqrt(
                yvals.reduce( (acc, val) => acc.concat((val-meanY)**2), []).reduce((acc, val) => acc += val, 0))
            // console.log(`Step ${step} - varX: ${variaX} (${variaX/avg_variantX}), varY: ${variaY} (${variaY/avg_variantY})`)
            if (variaY/avg_variantY < frac) {
                found = true
                break
            }
            avg_variantY = (avg_variantY * (candCnt-1) + variaY) / candCnt
        }
        avg_variantX = (avg_variantX * (step-1) + variaX) / step
    }
    if (found) {
        console.log(`Variant 3: ${step} steps`)
        printGrid(buildGrid(robots))
    }
}

// idea for other variants:
//  - after each step, count the number of robot "islands" - and if it is < 20% of robots, many must sit together
//  - ..

// Part 2 was different today: There are different ways how to solve this. I actually did the visual
// search first, and once I found it, thought of more clever approaches. So different solutions to part 2 today

if (tasks.includes(2)) {

    variant00()
    variant01()
    variant02a()
    variant02b()
    variant03()
}

let stop = performance.now()

console.log(`Load took ${((load-start)/1000).toFixed(6)} msecs, calculation ${((stop-load)/1000).toFixed(6)} msecs`)
