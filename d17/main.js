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

let registers = {
    'A': 0,    // A
    'B': 0,    // B
    'C': 0,    // C
}

for (let i = 0; i < 3; i++) {
    let sr = lines[i].match(/Register ([A-C]): ([0-9]+)/).slice(1,3)
    registers[sr[0]] = parseInt(sr[1])
}

let program = lines[4].match(/Program: ([0-9,]*)/)[1].split(',').map(Number)

let load = performance.now()

// Actual problem solving starts here ===========================================================================

function oct(num) {
    return `${num.toString(8)}`
}
function printOctal(regs) {
    console.log(`{ A: ${regs['A'].toString(8)}, B: ${regs['B'].toString(8)}, C: ${regs['C'].toString(8)} }`)
}

function getCombo(operand, regs) {
    if (operand >= 7) {
        console.log("ERROR: operand >= 7")
        exit(1)
    }
    let c = operand < 4 ? '-' : String.fromCharCode(operand+61)
    let v = operand < 4 ? operand : regs[c]
    return [c, v]
}

let no_debug = true

function run_program(regs = registers, prog = program) {
    let i = 0
    let output = []
    while (i < prog.length) {
        no_debug || printOctal(regs)
        let opcode = prog[i]
        let operand = prog[i+1]
        if (opcode == 0) {
            let [reg, op] = getCombo(operand, regs)
            no_debug || console.log(`  [${opcode}:${operand}]: A <- A >> ${op} (${reg})`)
            regs['A'] = regs['A'] >>> op
        } else if (opcode == 1) {
            no_debug || console.log(`  [${opcode}:${operand}]: B <- B (${oct(regs['B'])}) xor ${oct(operand)} = ${oct(regs['B'] ^ operand)}`)
            regs['B'] = regs['B'] ^ operand
        } else if (opcode == 2) {
            let [reg, op] = getCombo(operand, regs)
            no_debug || console.log(`  [${opcode}:${operand}]: B <- last digit of ${oct(op)} (${reg}) = ${oct(op % 8)}`)
            regs['B'] = op % 8
        } else if (opcode == 3) {
            no_debug || console.log(`  [${opcode}:${operand}]: jmp ${(regs['A'] != 0) ? operand : "ignore"}`)
            i = (regs['A'] != 0) ? operand-2 : i
        } else if (opcode == 4) {
            no_debug || console.log(`  [${opcode}:${operand}]: B <- B (${oct(regs['B'])}) xor C (${oct(regs['C'])}) = ${oct(regs['B'] ^ regs['C'])}`)
            regs['B'] = regs['B'] ^ regs['C']
        } else if (opcode == 5) {
            let [reg, op] = getCombo(operand, regs)
            no_debug || console.log(`  [${opcode}:${operand}]: OUTPUT last digit of ${oct(op)} (${reg}) = ${oct(op%8)}`)
            output.push(op % 8)
        } else if (opcode == 6) {
            let [reg, op] = getCombo(operand, regs)
            no_debug || console.log(`  [${opcode}:${operand}]: B <- A >> ${op} (${reg})`)
            regs['B'] = regs['A'] >>> op
        } else if (opcode == 7) {
            let [reg, op] = getCombo(operand, regs)
            no_debug || console.log(`  [${opcode}:${operand}]: C <- A >> ${op} (${reg})`)
            regs['C'] = regs['A'] >>> op
        }        
        i+= 2
    }
    return output
}
 
// several test programs 

function test1() {
    console.log("Test 1:")
    let regs = { 'A': 0, 'B': 0, 'C': 9 }
    let prog = [2, 6]
    let output = run_program(regs, prog)
    console.log("[" + output.join(',') + "]")
    console.log(regs['B']) // B == 1
}
function test2() {
    console.log("Test 2:")
    let regs = { 'A': 10, 'B': 0, 'C': 0 }
    let prog = [5,0,5,1,5,4]
    let output = run_program(regs, prog)
    console.log("[" + output.join(',') + "]")
    // output: 0,1,2
}
function test3() {
    console.log("Test 3:")
    let regs = { 'A': 2024, 'B': 0, 'C': 0 }
    let prog = [0,1,5,4,3,0]
    let output = run_program(regs, prog)
    console.log("[" + output.join(',') + "]")
    // output 4,2,5,6,7,7,7,7,3,1,0
    console.log(regs['A']) // A == 0
}
function test4() {
    console.log("Test 4:")
    let regs = { 'A': 0, 'B': 29, 'C': 0 }
    let prog = [1,7]
    let output = run_program(regs, prog)
    console.log("[" + output.join(',') + "]")
    console.log(regs['B']) // B == 26
}
function test5() {
    console.log("Test 5:")
    let regs = { 'A': 0, 'B': 2024, 'C': 43690 }
    let prog = [4,0]
    let output = run_program(regs, prog)
    console.log("[" + output.join(',') + "]")
    console.log(regs['B']) // B == 44354
}

// Part 1: Just execute the program. No big deal after a lot of tweking
// with the processing

if (tasks.includes(1)) {

    let output = run_program()
    console.log(`Part 1 results: [${output.join(',')}]`)    

    // test1()
    // test2()
    // test3()
    // test4()
    // test5()

}

// Part 2: Did a lot of manual analysis (as can be seen by all the output
// in the program if you debug). Idea is that you create the number "backwards"
// As can be seen in my input, the program...
//    ... takes the last 3 bits (last octet!) of A
//    ... does some bite flipping and xoring with some other part of A
//    ... calculcates the output and then removes the last digit from A (by right shifting) 
// Knowing that, you need to build your "input" by trying the possible combinations 
// by running the program with the relevant inputs

// find a solution for 'a' to create the program element at 'idx' recursively
function find_a(program, a, b, c, idx) {
    if (idx < 0) {
        return a
    }
    for (let i = 0; i < 8; i++) {
        // console.log(`${idx} - a: ${a} - i: ${i}`)
        let first = run_program({'A': a*8+i, 'B': b, 'C': c}, program)[0]
        if (first == program[idx]) {
            let next = find_a(program, a*8+i, 0, 0, idx-1)
            if (next != null) {
                return next
            }
        }
    }
    return null
}


if (tasks.includes(2)) {

    no_debug = true
    let a = find_a(program, 0, 0, 0, program.length-1)
    console.log(`Part 2 results: ${a}`)    
}

let stop = performance.now()

console.log(`Load took ${((load-start)/1000).toFixed(6)} msecs, calculation ${((stop-load)/1000).toFixed(6)} msecs`)

/*
Program: 2,4,1,1,7,5,4,0,0,3,1,6,5,5,3,0

2 - 1 - 7 - 4 - 0 - 1 - 5 - 3
4 - 1 - 5 - 0 - 3 - 6 - 5 - 0  

(2,4): B = last 3 bits of A = last octa digit
(1,1): B = flip last bit of B    : B ist gerade, wenn A ungerade und umgekehrt
(7,5): C = A / 2^B trunc = A >> B  : gerade oder ungerade anzahl and 
(4,0): B = B xor C
(0,3): A = A / 2^3 trunc = A >> 3 = remove last octa digit
(1,6): B = B xor 6
(5,5): print B /mod 8
(3,0): jump to beginning if A not zero 

PRINTING:
- output is generated by printing B (5, 5)

ITERATING:
- need to do it 16 times (original program hat 16 elems)
- jump is done at end to begin, if A not zero (3, 0)
  => need to succesively print and lower A, 15 times
- A is changed *only* by (0,3), dividing it by 8 = shifting it 3 bits
  => in last step A needs to be in [1-7]
  => A needs to be in (1+8^15-7+8^15)
  BUT: A is also used in calculation what to print!

WHAT TO PRINT (B):
- B <- take last three bits of A
  => B is in [0-7]!
- B <- flip the last bit of B
  => B is still in [0-7]!
  => note: if A is even, B is uneven and vice versa
- C <- to trunc(A / 2^B) -> A / 1, 2, 4, 8, 16, 32, 64, 128
    = shift A right by B [0-7]
  => as A decreased, so will C
- B <- B xor C  // might change last three bits only, as B is in [0-7]
- B <- B xor 6  // might change bits 1, 2 only
- print B

in order for B to be 0 (last printout), 
 B XOR 6 == 0 -> B = 6 (110) before
 B XOR C == 6 -> as B is in [0-7] before, C needs to be in [0-7 as well] 
   C was created by A / 2^B - but a A is in [0-7] in this last step, so is C

*/