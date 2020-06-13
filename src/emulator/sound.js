module.exports = {
  connect: state => {

    // Set up audio stuff to sound a nasty beep

    const audioCtx = new (window.AudioContext || window.webkitAudioContext || window.audioContext);

    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    gainNode.gain.value = 0;
    oscillator.frequency.value = 600;
    oscillator.type = 'triangle';

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start();

    // Check if we need to start or stop the beep

    state.soundInterval = setInterval(() => {
      if ( state.sound >  0 ) gainNode.gain.value = 0.1;
      if ( state.sound == 0 ) gainNode.gain.value = 0;
    }, 17) // 60Hz

  },
  disconnect: state => {
    clearInterval(state.soundInterval);
  }
}
