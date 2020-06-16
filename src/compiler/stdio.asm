
; Standard IO library for CHIPcode
; Routines in this file may only mess up `v0`
; Parameter values are at `end_of_program`

; clear_screen();
clear_screen:
  cls
  ret

; print_byte(value, xpos, ypos)
print_byte:
  ; Save v1 & v2 for later
  ld i, end_of_program + 3
  ld (i), v0-v2

  ; Get parameters
  ld i, end_of_program
  ld v0-v2, (i)

  ; Convert value to binary coded decimal
  ld i, print_byte_buffer
  bcd (i), v0

  ; Print characters
  ld i, print_byte_buffer + 0
  ld v0-v0, (i)
  sne v0, 0
  jp print_byte_first_zero
  call print_byte_draw
  jp print_byte_first_not_zero

print_byte_first_zero:
  add v1, 5
  ld i, print_byte_buffer + 1
  ld v0-v0, (i)
  se v0, 0
  call print_byte_draw
  jp print_byte_third_digit

print_byte_first_not_zero:
  add v1, 5
  ld i, print_byte_buffer + 1
  ld v0-v0, (i)
  call print_byte_draw

print_byte_third_digit:
  add v1, 5
  ld i, print_byte_buffer + 2
  ld v0-v0, (i)
  call print_byte_draw

  ; Retrieve v1 & v2
  ld i, end_of_program + 3
  ld v0-v2, (i)
  ret

print_byte_draw:
  getfont v0
  drw v1, v2, 5
  ret

print_byte_buffer:
  .db 0,0,0
