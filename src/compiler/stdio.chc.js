module.exports = `

safe function clear_screen() {
  raw cls
}

function print_byte(byte value, byte xpos, byte ypos) {
  raw <<

  ld i, print_byte_buffer
  bcd (i), value
  ld v0-v0, (i)
  sne v0, 0
  jp print_byte_first_zero
  call print_byte_draw
  jp print_byte_first_not_zero

print_byte_first_zero:
  add xpos, 5
  ld i, print_byte_buffer + 1
  ld v0-v0, (i)
  se v0, 0
  call print_byte_draw
  jp print_byte_third_digit

print_byte_first_not_zero:
  add xpos, 5
  ld i, print_byte_buffer + 1
  ld v0-v0, (i)
  call print_byte_draw

print_byte_third_digit:
  add xpos, 5
  ld i, print_byte_buffer + 2
  ld v0-v0, (i)
  call print_byte_draw
  ret

print_byte_draw:
  getfont v0
  drw xpos, ypos, 5
  ret

print_byte_buffer:
  .db 0,0,0

  >>
}

`;
