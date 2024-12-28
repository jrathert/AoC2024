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

// Part 1 - solved it using a linked list, not exactly knowing what to expect in part 2.
// Simply build a linked list of all entries and keeping track of the number of nodes 
// "Blinking" means to process a single node, which may change its value or make it split up
// in two separate nodes

let nodecnt = 0

class Node {
    constructor(val) {
        this.val = val
        this.next = null
    }
    process() {
        let num_digits = Math.floor(Math.log10(this.val))+1
        if (this.val === 0) {
            this.val = 1
        } 
        else if (num_digits % 2  === 0) {  
            let e = 10**(num_digits/2)
            let right = this.val % e
            let left = (this.val - right)/e
            let n = new Node(right)
            n.next = this.next
            this.val = left
            this.next = n
            nodecnt += 1
        }
        else {
            this.val = ''+ parseInt(this.val) * 2024
        }
    }
    append(val) {
        this.next = new Node(val)
    }
}

function printFromNode(n) {
    let vals = []
    let curr = n
    while (curr !== null) {
        vals.push(curr.val)
        curr = curr.next
    }
    console.log(`[${vals.join(',')}]`)
}

// blinking simply means to process all nodes in the list, making it longer

// solving task one starts by building the inital list and then
// blinking 25 times starting from the root
if (tasks.includes(1)) {

    function blinkFrom(n) {
        let curr = n
        while (curr !== null) {
            let next = curr.next
            curr.process()
            curr = next
        }
    }

    let vals = lines[0].split(' ').map(Number)

    let root = new Node(vals[0])
    let curr = root
    for (let i = 1; i < vals.length; i++) {
        curr.append(vals[i])
        curr = curr.next
    }
    nodecnt = vals.length
    // printFromNode(root)
    console.log(`Starting with ${nodecnt} nodes`)
    
    for (let i = 0; i < 25; i++) {
        blinkFrom(root)
    }

    console.log(`Part 1: ${nodecnt}`)    
}

// Part 2 - as my list approach did not scale well for part 2 (the list becoming 
// incredibly long) I needed another approach
// This time a cache solves the problem - realising that while processing all nodes,
// there are a lot of similar combinations of (value, #blink) that of course lead 
// the same result. So a bit of recursion and a cache does the trick 
//
// Still I do not know how to better build keys (and test for equality) than
// with strings. Do not like it... - need to improve my JS skills

class BlinkCache {
    constructor() {
        this.dict = {}
    }
    add(key, depth, val) {
        let k = `${key},${depth}` 
        if (k in this.dict) {
            this.dict[k] += val
        }
        else {
            this.dict[k] = val
        }
        return this.dict[k]
    }
    val(key, depth) {
        let k = `${key},${depth}`
        if (k in this.dict) {
            return this.dict[k]
        } 
        else {
            return null
        }
    }
}

let cache = new BlinkCache()

function blink(val, currdepth, maxdepth) {
    if (currdepth === maxdepth) {
        return 1
    }
    let exist = cache.val(val, currdepth)
    if (exist !== null) {
        return exist
    }

    let num_digits = Math.floor(Math.log10(val))+1
    let ret = 0
    if (val === 0) {
        ret = blink(1, currdepth+1, maxdepth)
    } 
    else if (num_digits % 2  === 0) {  // even number of digits
        let e = 10**(num_digits/2)
        let right = val % e
        let left = (val - right)/e
        ret = blink(left, currdepth+1, maxdepth) + blink(right, currdepth+1, maxdepth) 
    }
    else {
        ret = blink(val * 2024, currdepth+1, maxdepth)
    }
    cache.add(val, currdepth, ret)
    return ret
}


if (tasks.includes(2)) {
    let vals = lines[0].split(' ').map(Number)
    console.log(`Starting with ${vals.length} nodes`)

    const maxdepth = 75
    let totals = 0
    for (const v of vals) {
        totals += blink(v, 0, maxdepth)
    } 
    
    console.log(`Part 2: results: ${totals} `)

}

let stop = performance.now()

console.log(`Load took ${((load-start)/1000).toFixed(6)} msecs, calculation ${((stop-load)/1000).toFixed(6)} msecs`)
