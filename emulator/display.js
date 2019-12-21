const canvas  = document.getElementById('display');
const display = canvas.getContext('2d');

canvas.width = 64;
canvas.height = 32;

module.exports = {
  render: state => {
    const imageData = display.createImageData(64, 32);
    for ( let y = 0; y < 32; y++ ) {
      for ( let x = 0; x < 64; x++ ) {
        const memoryOffset  = Math.floor(y * 64 / 8 + x / 8);
        const pixelOffset   = x % 8;
        const displayOffset = y * 64 * 4 + x * 4;
        imageData.data[displayOffset+0] = state.ram[0x0F00 + memoryOffset] & (0b10000000 >> pixelOffset) ? 0x55 : 0xCC;
        imageData.data[displayOffset+1] = state.ram[0x0F00 + memoryOffset] & (0b10000000 >> pixelOffset) ? 0x55 : 0xCC;
        imageData.data[displayOffset+2] = state.ram[0x0F00 + memoryOffset] & (0b10000000 >> pixelOffset) ? 0x55 : 0xCC;
        imageData.data[displayOffset+3] = 0xFF;
      }
    }
    display.putImageData(imageData, 0, 0);
  }
}
