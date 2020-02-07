function bin2str(bin, join = ' ') {
  return Array.from(bin)
              .map(b => byte2str(b))
              .join(join);
}

function byte2str(byte) {
  return parseInt(byte, 10).toString(16).padStart(2, "0");
}

function word2str(word) {
  return bin2str([(word & 0xFF00) / 0x100, word & 0x00FF]);
}

module.exports = {
  bin2str, byte2str, word2str
}
