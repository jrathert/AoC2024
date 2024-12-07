# AoC2024
Advent of Code 2024 - in JavaScript ...

## About this repository

This year I am participating [Advent of Code](https://adventofcode.com/2024/) to have fun with _JavaScript_ (yeah!)

Although already "in programming" when JavaScript came up in the mid 1990ies, I never really got used to it. Maybe because I never got into web-programming (even today, I find HTML-CSS-JS quite exhausting), and never considered JavaScript to be a "real programming language" for server-side or even cli programming.

Now is the time! Please read about my learnings in [LEARNINGS.md](./LEARNINGS.md)

## What to find in this directory

There are two convenience (python) scripts as well as a few templates available, to make life easier: one to download input and prepare a template, and another just to download the input

- `prepare.py` - called via `prepare.py day` it will 
    1. (try to) download the input of the specified `day`
    2. create a target directory
    3. copy the input as well as the main Python and JavaScript template (`main-tmpl.py/.js`) into that directory and 
    4. start up VS Code. 
    
    E.g., `prepare.py 03` will create a director `d03` and put the respective input file `input.txt` and `main.py` into it. If the output directory already exists, the script will exit, to avoid overwriting any code. 

- `load_input.py` - called via `load_input.py day` it will 
    1. (try to) download the input of that day, 
    2. create a target directory (if it does not exist already) and 
    3. copy the input into it. 
    
    E.g., `load_input.py 03` will create a directory `d03` and put respective input file `input.txt` into that directory. If the output directory does exist, it is no error, any existing input file will be overwritten!

### Access to input files

Of course, downloading the input from the python scripts only works if the input is already available on the website (i.e. it must be at least midnight EST/UTC-5). Also, to be able to access the input, you need to put your AoC session variable into the `.env` file - it will be read and used by the python scripts:

```
sessiontoken=abcdefgh12345678...
```

You can grab this token using your browsers development tools after logging in into Advent of Code website, see [this reddit thread](https://www.reddit.com/r/adventofcode/comments/a2vonl/how_to_download_inputs_with_a_script/).

### Happy hacking

The `prepare.py` script starts up VS Code in the main directory, but you are supposed to open the `main.js` file in the directory of the respective day. 

### Note on subdirectories

The subdirectories contain my solutions. In the first days, I actually started with Python to get used to AoC (again) and successively implement first JS versions incl. boilerplate code. Starting day 5, you won't find any Python files any more. ;-)

## License

MIT License, Copyright (c) 2024 Jonas Rathert - see file `LICENSE.txt`
