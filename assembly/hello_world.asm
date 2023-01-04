.org $200

  cls
  ld v1, 1          ; X coord
  ld v2, 1          ; Y coord
  ld v3, 0          ; String offset

loop:
  ld i, string      ; Find character in string
  add i, v3

  ld v0-v0, (i)     ; Load character
  sne v0, 0         ; If zero, we're done
  jp endlessLoop

  se v0, '\'        ; Move to the next line
  jp print
  ld v1, 1
  add v2, 6
  add v3, 1
  jp loop

print:
  call asciiToFont  ; Find font pointer from ascii value
  ld v0-v0,(i)      ; Find character width

  drw v1, v2, 5     ; Draw character to screen

  add v1, v0        ; X coord = X + character width
  add v3, 1         ; Next character

  jp loop

endlessLoop:
  jp endlessLoop

string:
  .db "Hello world!\\This is a tiny font\on the CHIP-8",0

asciiToFont:
  ld v4, %01111111  ; Minus extended Ascii
  and v0, v4
  ld v4, 32         ; Minus control characters
  sub v0, v4
  ld i, font
  add i, v0
  add i, v0
  add i, v0
  add i, v0
  add i, v0
  add i, v0
  ret

font:

  ; Ascii 32 - 47: special characters

  .db 2
  .db 0,0,0,0,0 ; Space

  .db 2
  .db %10000000 ; !
  .db %10000000
  .db %10000000
  .db %00000000
  .db %10000000

  .db 4
  .db %10100000 ; "
  .db %10100000
  .db %00000000
  .db %00000000
  .db %00000000

  .db 6
  .db %01010000 ; #
  .db %11111000
  .db %01010000
  .db %11111000
  .db %01010000

  .db 6
  .db %01111000 ; $
  .db %10100000
  .db %01110000
  .db %00101000
  .db %11110000

  .db 4
  .db %10100000 ; %
  .db %00100000
  .db %01000000
  .db %10000000
  .db %10100000

  .db 5
  .db %01000000 ; &
  .db %10100000
  .db %01000000
  .db %10100000
  .db %01110000

  .db 2
  .db %10000000 ; '
  .db %10000000
  .db %00000000
  .db %00000000
  .db %00000000

  .db 3
  .db %01000000 ; (
  .db %10000000
  .db %10000000
  .db %10000000
  .db %01000000

  .db 3
  .db %10000000 ; )
  .db %01000000
  .db %01000000
  .db %01000000
  .db %10000000

  .db 6
  .db %00100000 ; *
  .db %10101000
  .db %01110000
  .db %10101000
  .db %00100000

  .db 4
  .db %00000000 ; +
  .db %01000000
  .db %11100000
  .db %01000000
  .db %00000000

  .db 3
  .db %00000000 ; ,
  .db %00000000
  .db %00000000
  .db %01000000
  .db %10000000

  .db 4
  .db %00000000 ; -
  .db %00000000
  .db %11100000
  .db %00000000
  .db %00000000

  .db 2
  .db %00000000 ; .
  .db %00000000
  .db %00000000
  .db %00000000
  .db %10000000

  .db 4
  .db %00100000 ; /
  .db %00100000
  .db %01000000
  .db %10000000
  .db %10000000


  ; Ascii 48 - 57: Numbers

  .db 5
  .db %01100000 ; 0
  .db %10010000
  .db %10010000
  .db %10010000
  .db %01100000

  .db 4
  .db %01000000 ; 1
  .db %11000000
  .db %01000000
  .db %01000000
  .db %11100000

  .db 5
  .db %11100000 ; 2
  .db %00010000
  .db %01100000
  .db %10000000
  .db %11110000

  .db 5
  .db %11100000 ; 3
  .db %00010000
  .db %01100000
  .db %00010000
  .db %11100000

  .db 5
  .db %10000000 ; 4
  .db %10010000
  .db %11110000
  .db %00010000
  .db %00010000

  .db 5
  .db %11110000 ; 5
  .db %10000000
  .db %11100000
  .db %00010000
  .db %11100000

  .db 5
  .db %01100000 ; 6
  .db %10000000
  .db %11100000
  .db %10010000
  .db %01100000

  .db 5
  .db %11110000 ; 7
  .db %00010000
  .db %00100000
  .db %01000000
  .db %01000000

  .db 5
  .db %01100000 ; 8
  .db %10010000
  .db %01100000
  .db %10010000
  .db %01100000

  .db 5
  .db %01100000 ; 9
  .db %10010000
  .db %01110000
  .db %00010000
  .db %01100000


  ; Ascii 58 - 64: More special characters

  .db 2
  .db %00000000 ; :
  .db %10000000
  .db %00000000
  .db %10000000
  .db %00000000

  .db 3
  .db %00000000 ; ;
  .db %01000000
  .db %00000000
  .db %01000000
  .db %10000000

  .db 4
  .db %00100000 ; <
  .db %01000000
  .db %10000000
  .db %01000000
  .db %00100000

  .db 4
  .db %00000000 ; =
  .db %11100000
  .db %00000000
  .db %11100000
  .db %00000000

  .db 4
  .db %10000000 ; >
  .db %01000000
  .db %00100000
  .db %01000000
  .db %10000000

  .db 4
  .db %11000000 ; ?
  .db %00100000
  .db %01000000
  .db %00000000
  .db %01000000

  .db 5
  .db %01100000 ; @
  .db %10010000
  .db %10110000
  .db %10000000
  .db %01100000


  ; Ascii 65 - 90: Capital letters

  .db 5
  .db %01100000 ; A
  .db %10010000
  .db %11110000
  .db %10010000
  .db %10010000

  .db 5
  .db %11100000 ; B
  .db %10010000
  .db %11100000
  .db %10010000
  .db %11100000

  .db 5
  .db %01110000 ; C
  .db %10000000
  .db %10000000
  .db %10000000
  .db %01110000

  .db 5
  .db %11100000 ; D
  .db %10010000
  .db %10010000
  .db %10010000
  .db %11100000

  .db 4
  .db %11100000 ; E
  .db %10000000
  .db %11100000
  .db %10000000
  .db %11100000

  .db 4
  .db %11100000 ; F
  .db %10000000
  .db %11000000
  .db %10000000
  .db %10000000

  .db 5
  .db %01110000 ; G
  .db %10000000
  .db %10110000
  .db %10010000
  .db %01100000

  .db 5
  .db %10010000 ; H
  .db %10010000
  .db %11110000
  .db %10010000
  .db %10010000

  .db 4
  .db %11100000 ; I
  .db %01000000
  .db %01000000
  .db %01000000
  .db %11100000

  .db 4
  .db %11100000 ; J
  .db %00100000
  .db %00100000
  .db %00100000
  .db %11000000

  .db 5
  .db %10010000 ; K
  .db %10100000
  .db %11000000
  .db %10100000
  .db %10010000

  .db 4
  .db %10000000 ; L
  .db %10000000
  .db %10000000
  .db %10000000
  .db %11100000

  .db 6
  .db %10001000 ; M
  .db %11011000
  .db %10101000
  .db %10001000
  .db %10001000

  .db 5
  .db %10010000 ; N
  .db %11010000
  .db %11110000
  .db %10110000
  .db %10010000

  .db 5
  .db %01100000 ; O
  .db %10010000
  .db %10010000
  .db %10010000
  .db %01100000

  .db 5
  .db %11100000 ; P
  .db %10010000
  .db %11100000
  .db %10000000
  .db %10000000

  .db 5
  .db %01100000 ; Q
  .db %10010000
  .db %10010000
  .db %10110000
  .db %01110000

  .db 5
  .db %11100000 ; R
  .db %10010000
  .db %11100000
  .db %10010000
  .db %10010000

  .db 5
  .db %01110000 ; S
  .db %10000000
  .db %01100000
  .db %00010000
  .db %11100000

  .db 6
  .db %11111000 ; T
  .db %00100000
  .db %00100000
  .db %00100000
  .db %00100000

  .db 5
  .db %10010000 ; U
  .db %10010000
  .db %10010000
  .db %10010000
  .db %01100000

  .db 5
  .db %10010000 ; V
  .db %10010000
  .db %10010000
  .db %01100000
  .db %01100000

  .db 6
  .db %10001000 ; W
  .db %10001000
  .db %10101000
  .db %11011000
  .db %10001000

  .db 6
  .db %10001000 ; X
  .db %01010000
  .db %00100000
  .db %01010000
  .db %10001000

  .db 6
  .db %10001000 ; Y
  .db %01010000
  .db %00100000
  .db %00100000
  .db %00100000

  .db 4
  .db %11100000 ; Z
  .db %00100000
  .db %01000000
  .db %10000000
  .db %11100000


  ; Ascii 91 - 96: Even more special characters

  .db 3
  .db %11000000 ; [
  .db %10000000
  .db %10000000
  .db %10000000
  .db %11000000

  .db 4
  .db %10000000 ; \
  .db %10000000
  .db %01000000
  .db %00100000
  .db %00100000

  .db 3
  .db %11000000 ; ]
  .db %01000000
  .db %01000000
  .db %01000000
  .db %11000000

  .db 4
  .db %01000000 ; ^
  .db %10100000
  .db %00000000
  .db %00000000
  .db %00000000

  .db 4
  .db %00000000 ; _
  .db %00000000
  .db %00000000
  .db %00000000
  .db %11100000

  .db 3
  .db %10000000 ; `
  .db %01000000
  .db %00000000
  .db %00000000
  .db %00000000


  ; Ascii 97 - 122: Lower case letters

  .db 4
  .db %00000000 ; a
  .db %01100000
  .db %10100000
  .db %10100000
  .db %01100000

  .db 4
  .db %10000000 ; b
  .db %10000000
  .db %11000000
  .db %10100000
  .db %11000000

  .db 4
  .db %00000000 ; c
  .db %01100000
  .db %10000000
  .db %10000000
  .db %01100000

  .db 4
  .db %00100000 ; d
  .db %00100000
  .db %01100000
  .db %10100000
  .db %01100000

  .db 4
  .db %00000000 ; e
  .db %01000000
  .db %10100000
  .db %11000000
  .db %01100000

  .db 3
  .db %01000000 ; f
  .db %10000000
  .db %11000000
  .db %10000000
  .db %10000000

  .db 4
  .db %00000000 ; g
  .db %01100000
  .db %10100000
  .db %01100000
  .db %11000000

  .db 4
  .db %10000000 ; h
  .db %10000000
  .db %11000000
  .db %10100000
  .db %10100000

  .db 2
  .db %10000000 ; i
  .db %00000000
  .db %10000000
  .db %10000000
  .db %10000000

  .db 3
  .db %01000000 ; j
  .db %00000000
  .db %01000000
  .db %01000000
  .db %10000000

  .db 4
  .db %10000000 ; k
  .db %10000000
  .db %10100000
  .db %11000000
  .db %10100000

  .db 3
  .db %11000000 ; l
  .db %01000000
  .db %01000000
  .db %01000000
  .db %01000000

  .db 4
  .db %00000000 ; m
  .db %10100000
  .db %11100000
  .db %10100000
  .db %10100000

  .db 4
  .db %00000000 ; n
  .db %11000000
  .db %10100000
  .db %10100000
  .db %10100000

  .db 4
  .db %00000000 ; o
  .db %01000000
  .db %10100000
  .db %10100000
  .db %01000000

  .db 4
  .db %00000000 ; P
  .db %11000000
  .db %10100000
  .db %11000000
  .db %10000000

  .db 4
  .db %00000000 ; q
  .db %01100000
  .db %10100000
  .db %01100000
  .db %00100000

  .db 4
  .db %00000000 ; r
  .db %10100000
  .db %11000000
  .db %10000000
  .db %10000000

  .db 3
  .db %00000000 ; s
  .db %01000000
  .db %10000000
  .db %01000000
  .db %10000000

  .db 3
  .db %10000000 ; t
  .db %10000000
  .db %11000000
  .db %10000000
  .db %01000000

  .db 4
  .db %00000000 ; u
  .db %10100000
  .db %10100000
  .db %10100000
  .db %01000000

  .db 4
  .db %00000000 ; v
  .db %10100000
  .db %10100000
  .db %01000000
  .db %01000000

  .db 4
  .db %00000000 ; w
  .db %10100000
  .db %10100000
  .db %11100000
  .db %10100000

  .db 4
  .db %00000000 ; x
  .db %10100000
  .db %01000000
  .db %01000000
  .db %10100000

  .db 4
  .db %00000000 ; y
  .db %10100000
  .db %10100000
  .db %01000000
  .db %10000000

  .db 3
  .db %00000000 ; z
  .db %11000000
  .db %01000000
  .db %10000000
  .db %11000000

  ; Ascii 123 - 126: Even more characters

  .db 4
  .db %01100000 ; {
  .db %01000000
  .db %10000000
  .db %01000000
  .db %01100000

  .db 2
  .db %10000000 ; |
  .db %10000000
  .db %10000000
  .db %10000000
  .db %10000000

  .db 4
  .db %11000000 ; }
  .db %01000000
  .db %00100000
  .db %01000000
  .db %11000000

  .db 5
  .db %00000000
  .db %01010000 ; ~
  .db %10100000
  .db %00000000
  .db %00000000

end:
