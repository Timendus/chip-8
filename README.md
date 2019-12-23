# CHIP-8 emulator

Just something I threw together, mostly within the span of 24 hours when I had a
free Saturday :)

See it in action at https://timendus.github.io/chip-8/. You can find some
CHIP-8 programs [here](https://github.com/dmatlack/chip8) and everywhere else on
the internet. Just download the binaries and load them to the emulator.

Note that there are no guarantees that this thing is bug-free. In fact, I found
a couple of side effects to opcodes being documented differently by different
sources. Hard to tell which is the right implementation. Also, I have no idea at
what speed this thing is supposed to run, other than the timers.

But anyway, most programs seem to run pretty well. If you find a bug with the
emulator still, please make a PR or at least submit an issue ;)

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
space bar to 5, which is what many games use.

### Is it an emulator though..?

No, it's probably more of an interpreter. Or a virtual machine. Depends on your
definitions. But I like the word emulator better in this case, because the
bytecode for CHIP-8 so closely resembles assembler for real hardware. And also
because I tried to make it look like a "device" 😉
