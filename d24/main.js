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

const [_reglines, _ruleslines] = data.split('\n\n')

// a map of all registers and their values
const registers = {}
for (const line of _reglines.trim().split('\n')) {
    let [reg, val] = line.split(':')
    val = parseInt(val.trim())
    registers[reg] = val
}

// a list of all rules, plus a map of targets and their rules
const allRules = []
const ruleMap = {}
for (const line of _ruleslines.trim().split('\n')) {
    let [first, op, sec, to, target] = line.split(' ')
    // console.log(line)
    const r = {
        op1: first.trim(),
        op2: sec.trim(),
        op: op.trim(),
        target: target.trim(),
        working: false
    }
    allRules.push(r)
    ruleMap[target] = r
}

// calculate the value of all registers in reg with a prefix 
function prefixValue(regs, prefix) {
    const vals = Object.keys(regs).filter(r => r[0]==prefix).sort((a, b) => a < b ? -1 : a>b ? 1 : 0)
    // console.log(vals)
    let i = 0
    let ret = 0
    for (const v of vals) {
        ret += regs[v] * 2**i
        i++
    }
    return ret
}

// return the number of registers in regs with a prefix
function numBits(regs, prefix) {
    return Object.keys(regs).filter(r => r[0]==prefix).length
}

// return number in binary string, padd with 0 to deflen if provided/longer than the binary represeantation
function num2String(num, deflen=-1) {
    let s = num.toString(2)
    let indent = deflen > s.length ? "0".repeat(deflen-s.length) : ""
    return indent+s
}

// process the rules with the provided registers by follwing the rules until all
// rules are processed
// returns the final registers
function processRules(regs, rules) {
    let remains = structuredClone(rules)
    let cregs = structuredClone(regs)
    while (remains.length != 0) {
        for (let rule of remains) {
            if (rule.op1 in cregs && rule.op2 in cregs) {
                if (rule.op == 'AND') {
                    cregs[rule.target] = cregs[rule.op1] & cregs[rule.op2]
                }
                else if (rule.op == 'OR') {
                    cregs[rule.target] = cregs[rule.op1] | cregs[rule.op2]
                }
                else if (rule.op == 'XOR') {
                    cregs[rule.target] = cregs[rule.op1] ^ cregs[rule.op2]
                }
                rule.working = true
            }
        }
        remains = remains.filter(r => r.working == false)
    }
    return cregs
}
// Actual problem solving starts here ===========================================================================

// Part 1 is easy - just do the calculation accoring to the gates

if (tasks.includes(1)) {
    let totals = 0

    console.log(`Number of input values: ${Object.keys(registers).length}`)
    console.log(`Number of rules: ${allRules.length}`)
    const regs = processRules(registers, allRules)
    console.log(`Total number registers: ${Object.keys(regs).length}`)
    totals = prefixValue(regs, 'z')

    console.log(`Part 1 results: ${totals}`)    
}

// Part 2 ...


if (tasks.includes(2)) {
    let totals = 0

    const regs = processRules(registers, allRules)

    const x = prefixValue(registers, 'x')
    const y = prefixValue(registers, 'y')
    const r = x+y
    const z = prefixValue(regs, 'z')

    const xl = numBits(registers, 'x')
    const yl = numBits(registers, 'y')
    const zl = numBits(regs, 'z')
    const ml = Math.max(xl, yl, zl)

    console.log(`x: ${x} & y: ${y} = ${x+y} vs. z: ${z} ???`)

    console.log("x: " + num2String(x, ml))
    console.log("y: " + num2String(y, ml))

    let r_s = num2String(r, ml)
    console.log("r: " + r_s)

    let z_s = num2String(z, ml)
    console.log("z: " + z_s)

    let buf = ["   "]
    let diffIndices = []
    for (let i = 0; i <= ml; i++) {
        if (z_s[i] != r_s[i]) {
            buf.push("^")
            diffIndices.push(45-i)
        }
        else {
            buf.push(" ")
        }
    }
    console.log(buf.join(''))

    console.log(`Differs at positions [${diffIndices.sort((a,b) => a-b)}]`)

    console.log("With that information, solved it manually")

    console.log(`Part 2 results: ${totals}`)    
}

let stop = performance.now()

console.log(`Load took ${((load-start)/1000).toFixed(6)} msecs, calculation ${((stop-load)/1000).toFixed(6)} msecs`)
