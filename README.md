# CHIP-8 emulator

Just something I threw together in 24 hours because... why not :)

See it in action at https://timendus.github.io/chip-8/. You can find some
CHIP-8 programs [here](https://github.com/dmatlack/chip8) and everywhere else on
the internet.

Note that this thing probably still has a few bugs. Not everything runs
perfectly. Most of the programs that just draw a picture to the screen run just
fine. Some of the games have issues. Of course it's always a question of "is
this the game's fault or mine?" because many games use SCHIP or other "advanced"
features. And we don't have those.

To see the program instructions, open your browser's developer console.

### Is it an emulator though..?

No, it's probably more of an interpreter. Or a virtual machine. Depends on your
definitions. But I like the word emulator better in this case, because the
bytecode for CHIP-8 so closely resembles assembler for real hardware. And also
because I tried to make it look like a "device" 😉

### Keys

The keypad of CHIP-8 is pretty weird. You can click any of the keys (with the
mouse or a touch screen) to trigger them. Also, you can press any of the keys on
your physical keyboard that correspond to the labels on the virtual keys (0-9
and A-F). As an extra, I have bound the cursor keys to 2, 4, 6 and 8 and the
space bar to 5, which is what many games use.
