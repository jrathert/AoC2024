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

// Part 1 simply follows the approach as shown in the problem description: Create a (huge) vector representing the disk
// and then assign the file block and rearrange. 

if (tasks.includes(1)) {

    const line = lines[0]

    // identify necessary length of the vector, create and fill it.
    let diskmap = line.split('').map(Number)
    let disklen = diskmap.reduce((accumulator, val) => accumulator+val, 0)
    let disk = Array(disklen).fill('.')

    let pos = 0
    for (const [idx, len] of diskmap.entries()) {
        if (idx % 2 == 0) {
            const c = `${idx/2}`
            for (let j = 0; j < len; j++) {
                disk[pos+j] = c
            }    
        }
        pos += len
    }

    // now use two indices (s = start, e = end) and find available
    // slots (s) to move in file block (e)
    let s = 0
    let e = disklen-1
    while (true) {
        s = disk.indexOf('.', s)
        while (disk[e] == '.') e -= 1
        if (e <= s) {
            break
        }
        disk[s] = disk[e]
        disk[e] = '.'
        e -= 1
    }

    // last count checksum
    let checksum = disk.slice(0, e+1).reduce((accumulator, val, idx) => accumulator+ idx * val, 0)

    console.log(`Part 1 checksum: ${checksum}`)
}

// Part 2 requires a doubly-linked list to stay efficient. Idea is to create an item for each block
// and then go backwards, identifying relevant blocks and check if they can be moved forward (by looking into
// each available slot sequentially - this can maybe be improved by keeping track in a disctionary?!)
// Another idea for improvement: Keep track of first available slot and once candidates are
// BEFORE that first slot, you could stop

class Block {
    constructor(len, id) {
        this.len = len
        this.id = id
        this.next = null
        this.prev == null
    }
    append(b) {
        this.next = b
        b.prev = this
    }
}

function compact(b) {
    // b holds an '.' as id, e.g., is an empty block
    // now check if before and/or after there are other 
    // empty block that we can combined into b, eliminating
    // the other blocks from the list
    let p = b.prev
    if (p != null && p.id == '.') {
        b.len += p.len
        b.prev = p.prev
        b.prev.next = b
        p = null   // memory can be free'd by GC
    }
    let n = b.next
    if (n != null && n.id == '.') {
        b.len += n.len
        b.next = n.next
        b.next.prev = b
        n = null  // memory can be free'd by GC
    }
}

if (tasks.includes(2)) {

    const line = lines[0]
    
    // build a doubly linked list with the first element (head) being the fist block,
    // the last element being an "artificial" element (tail) representing the end of the disk
    let head = null
    let tail = null
    let curr = null
    for (let i = 0; i < line.length; i++) {
        let b = new Block(parseInt(line[i]), (i%2 == 0 ? i/2 : '.'))
        if (head == null) {
            head = b
        }
        if (curr != null) {
            curr.append(b)
        }
        curr = b
    }
    tail = new Block(0, -1)
    curr.append(tail)


    // now go backwards through the list, find all candidates and
    // check whether they can be moved
    let nextcand = tail.prev

    while (nextcand != null) {
        
        // find a candidate going backwards
        let cand = nextcand
        while (cand != null && cand.id == '.') {
            cand = cand.prev
        }            
        if (cand == null || cand == head) {
            // we are done
            break  
        }

        // we have a candidate, keep track of next starting point
        nextcand = cand.prev
        
        // find a slot where cand would fit, starting from the beginning of the list until the candidate
        let slot = head
        while (slot != cand && (slot.id != '.' || slot.len < cand.len)) {
            slot = slot.next
        }
        if (slot == cand) {
            // no matching slot found, continue with next candidate
            continue
        }

        // now we have a candidate and a slot where it would fit
        // replace the candidate by an empty block first...
        let b = new Block(cand.len, '.')
        b.next = cand.next
        if (b.next != null) {
            b.next.prev = b
        }
        b.prev = cand.prev
        b.prev.next = b

        // ...then insert the candidate before the slot...
        slot.prev.next = cand
        cand.prev = slot.prev
        cand.next = slot
        slot.prev = cand
        
        // ... and last reduce size of the slot, and maybe even delete it
        slot.len -= cand.len
        if (slot.len == 0) {
            // remove slot
            let p = slot.prev
            p.next = slot.next
            slot.next.prev = p
            slot = null
        }

        // (by inserting the new empty slot, we might have created 
        // subsequent empty slots that can/should be combined to
        // a single larger one)
        compact(b)    
    }

    // now calculate the checksum by going through all items in list
    let checksum = 0
    let pos = 0
    curr = head
    while (curr != null) {
        if (curr.id != '.' && curr.id != -1) {
            for (let i = 0; i < curr.len; i++) {
                checksum += (pos + i) * curr.id
            }
        }
        pos += curr.len
        curr = curr.next
    }

    console.log(`Part 2 checksum: ${checksum}`)
}

let stop = performance.now()

console.log(`Load took ${((load-start)/1000).toFixed(6)} msecs, calculation ${((stop-load)/1000).toFixed(6)} msecs`)
