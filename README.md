brainless
=========

#### Interpreter for the Brainfuck esoteric language ####

[![npm][npm-image]][npm-url]
[![david][david-image]][david-url]

[Wikipedia page](http://en.wikipedia.org/wiki/Brainfuck).

The following features are supported:

- Almost unlimited number of cells. The ECMA specification for the maximum array length is an unsigned 32-bit
integer, `2^32-1 = 4,294,967,295 cells`.  
  Negative pointer values are also valid, but they are stored in a separate tape. This means that the total tape length is `2*(2^32-1) = 8,589,934,590 cells`.  
  The state of the program when the pointer is outside these valid ranges is undefined.
- Each cell stores an IEEE 754 double-precision integer (64 bits), so negative numbers and UTF8 multibyte characters are allowed.
- It recognizes the usual tokens, but adds the de-facto `#` for debugging purposes. Prints a json object to the stdout, something similar to this: `{"pointer":-1,"tape":{"p":[97,98,99,0],"n":[null,0]}}`.
- It doesn't recognize the token `!`. There's a cli option to enter an input string.

Tokens:

<table>
  <tr>
    <td>&gt;</td>
    <td>Increments the pointer.</td>
  </tr>
  <tr>
    <td>&lt;</td>
    <td>Decrements the pointer.</td>
  </tr>
  <tr>
    <td>+</td>
    <td>Increments the cell value where points the pointer.</td>
  </tr>
  <tr>
    <td>-</td>
    <td>Decrements the cell value where points the pointer.</td>
  </tr>
  <tr>
    <td>.</td>
    <td>Outputs to the stdout the UTF8 character stored in the cell where points the pointer.</td>
  </tr>
  <tr>
    <td>,</td>
    <td>Reads a UTF8 character and stores it in the cell where points the pointer.</td>
  </tr>
  <tr>
    <td>[</td>
    <td>If the value in the cell where points the pointer is 0, it jumps to the ] token, otherwise it executes the code inside [ and ].</td>
  </tr>
  <tr>
    <td>]</td>
    <td>If the value in the cell where points the pointer is not 0, it jumps back again to the [ token, otherwise it continues with the program execution.</td>
  </tr>
  <tr>
    <td>#</td>
    <td>Outputs the pointer and the state of the tape. For debugging purposes.</td>
  </tr>
</table>

#### Usage ####

If the program needs to read an input value but no string is provided, it prompts a cli message asking for a character:

```
$ brainfuck examples/rot13
> a
n
> b
o
> c
p
```

Send a SIGINT signal (ctrl+c) to kill the process.

__CLI__

```
$ brainfuck -h
Usage: brainfuck [options] <input_file>

Interpreter for the Brainfuck esoteric language

  -i, --input=STRING          STRING to read during the program execution
  -h, --help                  Display this help message and exit
  -v, --version               Output version information and exit

Report bugs to <gagle@outlook.com>.
```

For example:

```
$ brainfuck examples/reverse -i abc
cba
```

Note: If the file doesn't exist and doesn't have an extension, it tries to read the same file with the extension `.bf`.

__Programmatically__

___module_(code[, input]) : undefined__

```javascript
var bf = require('brainless');
bf(',[>,]<[.<]', 'abc');
// cba
```

[npm-image]: http://img.shields.io/npm/v/bole-mongodb.svg
[npm-url]: https://npmjs.org/package/bole-mongodb
[david-image]: https://img.shields.io/david/gagle/node-brainless.svg
[david-url]: https://david-dm.org/gagle/node-brainless