# Learnings in AoC 2024 in JavaScript

I document some of the relevant learnings during my AoC 2024 journey. Please note that some of these only occured succesively during the optimization or "cleanup" of code already written. Some of the code files might have a documented version history as well...

## General

- Basic stuff, such as file I/O or system calls such as `exit()` are only available as node modules, not easily available as part of the standard language - probably due to its history?
- I use `strict mode` of course, but I did not choose to do TypeScript, as I also want to understand about JS advantages as an untyped language. During the first few days, however, I did not see major advantages yet
- Support for "pre-runtime checks" in VS Code seems not en par with, e.g., Python. But maybe I just miss the proper VS code extension?

 
## Day 1

- Already at day 1 I used regexp as well as `map()`, `filter()` and `sort()`, even chaining these things.
- I implemented a first "class" - mimicing the Python `Counter` helper class
- Learned about how to deliver default values from dictionaries using the null coalescing operator (`??`)
- By VS Code hints I learned that unused variables (e.g., in predicates) should be preceded with an `_`
- Also considered `reduce()` for calculating the sum of some values in _two different_ arrays - but that did not work.

## Day 2

- First time I `slice()`d some arrays
- Iterate over keys of an object / dictionary
- Return objects from a function

## Day 3

- More advanced regexp with groups

## Day 4

- Learned a bit about `push()`ing to an array, and again used regexp. Not much more.

## Day 5

- Learned about the handy destructuring assignment (`[x, y] = some other list with 2 values`), really useful when parsing input 

## Day 6

- Learned about deep copying an array of objects (in this case: strings) with `structuredCopy()`

## Day 7

- Just how to concatenate numbers leveraging the implicit string conversion of JavaScript (`"" + a + b`)
- ... and then learned that `a*10**(Math.floor(Math.log10(b))+1)+b` is roughly factor 3 faster

## Day 8

- Object equality is an issue in JavaScript, you cannot just throw objects or arrays into a `Set` and then you are done.
- Function pointers work. ;-)

## Day 9

- How to implement a doubly-linked list

## Day 10

- Nothing special, just how to work with Sets (i.e.: copy them)

## Day 11

- Recursion works, if you implement a cache properly
- Still need some more time to learn about some basic concepts (like efficient
  dictionary keys etc. in JavaScript)

## Day 12

- You always need a Counter class...

## Day 13

- regular experssions will never be my friends at 6am
- loving maths

## Day 14

- How to spot a christmas tree in a grid
- How JavaScript deals when using negative numbers with modulo

## Day 15

- Used .forEach() the first time - could have done that earlier
- Feeling more and more comfortable with grid thinking again. As every year,
  in the beginning I struggle with x, y being swapped during the iterations...

## Day 16

- JavaScript / Node is not very helpful if you do weird typos like `path.push[s]` instead of `path.push(s)`...
- Copying large arrays is time consuming
- In general not too happy

## Day 17

- JavaScript has problems with `>>` - better use `>>>` - see [StackOverflow](https://stackoverflow.com/a/56866416/10272577)
- Things like that can take you hours...

## Day 18

- Dijkstra, finally - and bruce force works, then
- Importing from another file in same directory
- Start believing I will never get to love JavaScript. Simply miss elegance. I know there is some 
  "functional programming style" even with JS, but simply do not get into it 

## Day 19

- Caching rules the world!
- Dynamic typing can be convenient - but also dangerous, especially if you play around "optimizing" 
  your code. I initialized a to-be-`boolean` value with `'  '`, and it took me quite a lot of 
  debugging until I found out what was wrong.
- Depth-first was important in part 1

## Day 20

- I slowly start using functional programming style in JS. Then realized I do 
  not need the code I wrote. ;-)
- Brute force works.

## Day 21-25

- ... the best is yet to come?

