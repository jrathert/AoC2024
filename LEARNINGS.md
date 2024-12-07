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

 - Learned about dee copying an array of objects (in this case: strings) with `structuredCopy()`

 ## more to come...