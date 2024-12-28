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

let data = load_data(test_only)

const [_reglines, _ruleslines] = data.split('\n\n')

// a map of all registers and their values
const registers = {}
for (const line of _reglines.trim().split('\n')) {
    let [reg, val] = line.split(':')
    val = parseInt(val.trim())
    registers[reg] = val
}
const num_registers = Object.keys(registers).length

// a list of all rules, plus a map of targets and their rules
const rules = {}
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
    rules[target] = r
}
const num_rules = Object.keys(rules).length

let load = performance.now()

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

function findGate(op1, op, op2, rules_p) {
    const m = Object.values(rules_p).filter(
        r => (((r.op1 === op1 && r.op2 === op2) || (r.op1 === op2 && r.op2 === op1)) && r.op === op))
    if (m.length > 1) {
        console.log("ERROR - more than one rule? Should not happen.")
        return null
    }
    else if (m.length === 1) {
        return m[0].target 
    }
    else {
        return null
    }
}

function swap(r1, r2, rules) {
    let tmp = rules[r2]
    rules[r2] = rules[r1]
    rules[r2].target = r2
    rules[r1] = tmp
    rules[r1].target = r1
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

// process the rules with the provided registers by following the rules until all
// rules are processed
// returns the final registers
function processRules(regs_p, rules_p) {
    // make a list from all the rules, as this will be 
    let remains = structuredClone(Object.values(rules_p))
    let regs = structuredClone(regs_p)
    while (remains.length !== 0) {
        for (const rule of remains) {
            if (rule.op1 in regs && rule.op2 in regs) {
                if (rule.op === 'AND') {
                    regs[rule.target] = regs[rule.op1] & regs[rule.op2]
                }
                else if (rule.op === 'OR') {
                    regs[rule.target] = regs[rule.op1] | regs[rule.op2]
                }
                else if (rule.op === 'XOR') {
                    regs[rule.target] = regs[rule.op1] ^ regs[rule.op2]
                }
                rule.working = true
            }
        }
        remains = remains.filter(r => r.working === false)
    }
    return regs
}

// This is how to solve the rules/wrong gate solved:
// 
// Ideas is then to repeatedly iterate over the bits from 0... maxlen
// until an error is found - fix it by swapping and restart - until maxlen reached
//
// In my input data, it turned out that only the first two types of swaps occured
// (changing output gates of x_xor_y and x_and_y OR output gates of
// z_n and the last carry (c_n) XOR'd with x_xor_y)
//
function fixRules(rules, bf_len) {
  
    let swapped = []
    let bit = 0
    let c_n = null     // last carry bit
  
    while (true) {

        const x_n = `x${bit<10?"0":""}${bit}`
        const y_n = `y${bit<10?"0":""}${bit}`
        const z_n = `z${bit<10?"0":""}${bit}`

        if (bit === 0) {
            c_n = findGate(x_n, 'AND', y_n, rules)
        }
        else {
            // these alway exist
            let x_xor_y = findGate(x_n, "XOR", y_n, rules)
            let x_and_y = findGate(x_n, "AND", y_n, rules)

            // now find the correspoinding z_n
            let out = findGate(x_xor_y, "XOR", c_n, rules)
            if (out === null) {
                // no output gate found - x_xor_y and x_and_y must be swapped
                swapped.push(...[x_and_y, x_xor_y])
                swap(x_and_y, x_xor_y, rules)
                
                // re-start from beginning
                bit = 0
                continue
            }

            if (out !== z_n) {
                // wrong output gate found - out and z_n must be swapped
                swapped.push(...[out, z_n])
                swap(out, z_n, rules)
                
                // re-start from beginning
                bit = 0
                continue
            }
            // the next two are assumed to never be swapped, as
            // these are not direct outputs
            out = findGate(c_n, 'AND', x_xor_y, rules)
            if (out === null) {
                // no output gate found - c_n an x_xor_y must be swapped
                // Did not happen with my data
                swapped.push(...[c_n, x_xor_y])
                swap(c_n, x_xor_y, rules)
                
                // re-start from beginning
                bit = 0
                continue
            }
            c_n = findGate(out, 'OR', x_and_y, rules)
            if (c_n === null) {
                // no output gate found - out an x_and_y must be swapped
                // Did not happen with my data
                swapped.push(...[out, x_and_y])
                swap(out, x_and_y, rules)
                
                // re-start from beginning
                bit = 0
                continue
            }
        }
        bit += 1
        if (bit >= bf_len-1) 
            break
    }
    return swapped
}

// Actual problem solving starts here ===========================================================================

// Part 1 is easy - just do the calculation accoring to the gates

if (tasks.includes(1)) {
    let totals = 0

    console.log(`Number of input registers: ${num_registers}`)
    console.log(`Number of input rules: ${num_rules}`)
    const regs = processRules(registers, rules)
    console.log(`Total number registers: ${Object.keys(regs).length}`)
    totals = prefixValue(regs, 'z')

    console.log(`Part 1 results: ${totals}`)    
}

// Part 2 was a bit tricky - I first was able to solve it manually, but only later found
// an computational approach. Solution prints a lot of info I used for manual
// colving

if (tasks.includes(2)) {

    // Describe the problem first - this was actually used to solve it manually
    const regs = processRules(registers, rules)

    const x = prefixValue(regs, 'x')
    const y = prefixValue(regs, 'y')
    const r = x+y
    const z = prefixValue(regs, 'z')

    const bf_len = numBits(regs, 'z')

    console.log(`x: ${x} & y: ${y} = ${r} vs. z: ${z}`)

    let r_s = num2String(r, bf_len)
    let z_s = num2String(z, bf_len)

    console.log("x: " + num2String(x, bf_len))
    console.log("y: " + num2String(y, bf_len))
    console.log("r: " + r_s)
    console.log("z: " + z_s)

    let buf = ["   "]
    let diffIndices = []
    for (let i = 0; i <= bf_len; i++) {
        if (z_s[i] !== r_s[i]) {
            buf.push("^")
            diffIndices.push(45-i)
        }
        else {
            buf.push(" ")
        }
    }
    console.log(buf.join(''))
    console.log(`Differs at positions [${diffIndices.sort((a,b) => a-b)}]`)

    // Solution starts here
    let swapped = fixRules(rules, bf_len)
    console.log(`Swappes as they appeared:     [${swapped}]`)    
    console.log(`Swappes sorted (pt 2 result): [${swapped.sort((a,b) => a < b ? -1 : a > b ? 1 :0)}]`)
}

let stop = performance.now()

console.log(`Load took ${((load-start)/1000).toFixed(6)} msecs, calculation ${((stop-load)/1000).toFixed(6)} msecs`)
