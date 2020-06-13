module.exports = {
  connect: state => {
    state.timerInterval = setInterval(() => {
      if ( state.delay > 0 ) state.delay--;
      if ( state.sound > 0 ) state.sound--;
    }, 17) // ~60Hz
  },
  disconnect: state => {
    clearInterval(state.timerInterval);
  }
}
