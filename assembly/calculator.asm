; Test program; let's see if we can assemble this
; Also: testing comments.

.org 512

  cls
  ld v0, 20
  ld v10, $A
  call drawChar
  ld v10, $B
  call drawChar
  ld v10, $C
  call drawChar

loop:
  jp loop      ; Get stuck in endless loop

drawChar:
  getfont v10
  ld v1, 11
  drw v0, v1, 5
  add v0, 5
  ret

  .db $FF, $FF, $FF
  .db "Hello world", 0
  .db $FF, $FF, $FF
