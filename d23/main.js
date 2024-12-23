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

// allNodes contains all nodes with a set of their neighbors
// will be used in both parts
let allNodes = {}
for (const line of lines) {
    const [c1, c2] = line.split('-')
    let c1Set = allNodes[c1] || new Set()
    let c2Set = allNodes[c2] || new Set()
    c1Set.add(c2); allNodes[c1] = c1Set
    c2Set.add(c1); allNodes[c2] = c2Set
}

// Part 1 is "brite force": Just iterate over all nodes that start
// with 't', visit their neighbors and find all pairs of neighbors, that are
// itself neighbors, to identify a "triplet"
// by sorting the elements in the triplet and using a set to store them,
// we avoid doublettes, i.e., when two nodes in a triplet start wit 't'
// not very efficient, but works
if (tasks.includes(1)) {
    let totals = 0
    
    // tripleSets will is itself a set containing all "triplets" (as strings)
    const tripleSets = new Set()

    // iterate over all nodes that start with 't'
    const tKeys = Object.keys(allNodes).filter(k => k[0] === 't')
    for (const k of tKeys) {
        
        // k is a node that starts with 't'
        // find all pairs of nodes in the neighbors of k
        // that are themselves neighbors
        const nArr = new Array(...allNodes[k])
        for (let i = 0; i < nArr.length; i++) {
            for (let j = i+1; j < nArr.length; j++) {
                if (allNodes[nArr[i]].has(nArr[j])) {
                    // sort, as we want to avoid doublettes in the set
                    let v = [k, nArr[i], nArr[j]].sort() 
                    tripleSets.add(`${v[0]},${v[1]},${v[2]}`)
                }
            }
        }
    }
    totals = tripleSets.size

    console.log(`Part 1 results: ${totals}`)    
}

// Part 2 was more difficult and could only be solved by some research and finding
// the "MaxClique" problem: https://en.wikipedia.org/wiki/Clique_problem
// And a bit later: https://en.wikipedia.org/wiki/Bron%E2%80%93Kerbosch_algorithm

let maxCliques = []
function BronKerbosch1(R, P, X) {
    if (P.size == 0 && X.size == 0) {
        maxCliques.push(R)
    } else {
        for (const v of P) {
            const neigh = allNodes[v]
            const vSet = new Set([v])
            BronKerbosch1(R.union(vSet), P.intersection(neigh), X.intersection(neigh))
            P = P.difference(vSet)
            X = X.union(vSet)
        }
    }
}

if (tasks.includes(2)) {
    let totals = 0

    const allKeys = Object.keys(allNodes)
    let R = new Set()
    let P = new Set(allKeys)
    let X = new Set()
    BronKerbosch1(R, P, X) 

    if (maxCliques.length == 0) {
        totals = -1
    }
    else {
        // maxCliques contains ALL max cliques of the graph
        // we expect there is only exactly one with max length
        // so sort, get the values into an array, sort that and done
        maxCliques = maxCliques.sort((a, b) => b.size - a.size)
        let elems = maxCliques[0].values().toArray()
        elems = elems.sort((a, b) => a < b ? -1 : (b < a ? 1 : 0))
        console.log(elems.join(','))
        totals = elems.length
    }

    console.log(`Part 2 results: ${totals}`)    
}

let stop = performance.now()

console.log(`Load took ${((load-start)/1000).toFixed(6)} msecs, calculation ${((stop-load)/1000).toFixed(6)} msecs`)
