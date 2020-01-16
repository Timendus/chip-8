# CHIP-8 fun

Just a fun project that began when I had a free Saturday and wrote much of the
emulator in a 24-hour programming spree. I've added an assembler over
Christmas, again finding myself with some free time on my hands. Besides
learning more about writing emulators and assemblers and having some fun, this
has absolutely no practical purpose. And that's the whole idea of having fun in
your spare time, isn't it? 😉

## The emulator

See it in action at https://timendus.github.io/chip-8/. You can find some
CHIP-8 programs [here](https://github.com/dmatlack/chip8) (and everywhere else
on the internet, just Google) or you can try
[my own simple creations](https://github.com/Timendus/chip-8/tree/master/assembly).
Just download the binaries (`*.ch8` seems to be the convention) and load them
into the emulator.

### Reliability

Note that there are no guarantees that this thing is bug-free. In fact, I found
a couple of side effects to opcodes being documented differently by different
sources. Hard to tell which is the right implementation. Also, I have no idea at
what speed this thing is supposed to run, other than that the timers run at 60Hz.

But anyway, most programs seem to run pretty well. If you find a bug with the
emulator still, please make a PR or at least submit an issue ;)

### Debugging features

When you load a program, it gets disassembled to the browser console. You can
also see the currently running instructions there by toggling "Instructions".
Note that this outputs a lot of instructions, pretty quickly. So this is mostly
useful for stepping through the code. Combined with the "Debugger" feature, this
should make it pretty usable as a development emulator.

### Keys

The keypad of CHIP-8 is pretty weird. You can click any of the keys (with the
mouse or a touch screen) to trigger them. Also, you can press any of the keys on
your physical keyboard that correspond to the labels on the virtual keys (0-9
and A-F). As an extra, I have bound the cursor keys to 2, 4, 6 and 8 and the
space bar to 5, which is what many games seem to use.

### Is it an emulator though..?

No, it's probably more of an interpreter. Or a virtual machine. Depends on your
definitions. But I like the word emulator better in this case, because the
bytecode for CHIP-8 so closely resembles assembler for real hardware. And also
because I tried to make it look like a "device" 😉

## The assembler

Having played with z80 assembler a lot, years ago, I thought it would be fun to
have an assembler too. Just something simple that would allow me to see if this
super limited instruction set is of any use in actually writing programs.

I have to admit that I didn't really like the instruction set. But I didn't hate
it either, it's probably "fixable" 😉. In my opinion it mostly really misses
`push` and `pop`. I had a hard time keeping all my registers safe without it.
Also, having just one word-sized index register (`i`) makes it tricky to do
the simplest things like keeping track of which character you're outputting
while also looking up the sprite data for that character. I used an offset
register to work around this in my [`hello_world` program](https://github.com/Timendus/chip-8/blob/master/assembly/hello_world.asm).

### Reliability

Note that all the warnings about the reliability of the emulator above are
equally applicable to the assembler 😂

### Usage on the command line

```bash
$ cd assembler
$ ./asm.js

You need to specify a file to compile.

./asm.js --file myprogram.asm [--output binary.ch8] [--outputModel] [--outputLabels]
```

If you don't specify an output file with the --output flag, it will just spit
out bytes to the console in HEX format.

The command line syntax could be much better, but my goal with this (if I ever
do any more work on this project) would be to have an editor and an assembler in
the webbrowser. For some on-the-go fun.
