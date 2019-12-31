.org $200

  ; Setup
  cls
  ld v1, 25     ; X coord

  ld v0, $A     ; Draw A
  call drawChar

  ld v0, $B     ; Draw B
  call drawChar

  ld v0, $C     ; Draw C
  call drawChar

endlessLoop:
  jp endlessLoop

drawChar:
  ld v2, 12     ; Y coord
  getfont v0
  drw v1, v2, 5
  add v1, 5
  ret
