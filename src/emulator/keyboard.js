const kbdState = new Array(16);

module.exports = {
  pressed: key => {
    return kbdState[key];
  },

  waitPress: () => {
    return new Promise((resolve, reject) => {
      let interval = setInterval(() => {
        // If any key is pressed, wait for release
        if ( kbdState.every(b => !b) ) {
          clearInterval(interval);
          interval = setInterval(() => {
            for ( let i in kbdState ) {
              if ( kbdState[i] ) {
                clearInterval(interval);
                return resolve(i);
              }
            }
          }, 10);
        }
      }, 10);
    });
  }
}

const keyMap = {
  '0': 0,
  '1': 1,
  '2': 2,
  '3': 3,
  '4': 4,
  '5': 5,
  '6': 6,
  '7': 7,
  '8': 8,
  '9': 9,
  'a': 10,
  'b': 11,
  'c': 12,
  'd': 13,
  'e': 14,
  'f': 15,

  'ArrowUp':    2,
  'ArrowDown':  8,
  'ArrowLeft':  4,
  'ArrowRight': 6,
  ' ':          5
}

window.addEventListener('keydown', e => {
  // Don't catch events if emulator is not in focus
  if ( !document.querySelector('section.right').contains(document.activeElement) ) return;
  if ( keyMap[e.key] == null ) return;
  kbdState[keyMap[e.key]] = true;
  const button = document.getElementById('Btn'+keyMap[e.key]);
  if ( button ) button.classList.add('active');
  e.preventDefault();
});

window.addEventListener('keyup', e => {
  // Don't catch events if emulator is not in focus
  if ( !document.querySelector('section.right').contains(document.activeElement) ) return;
  if ( keyMap[e.key] == null ) return;
  kbdState[keyMap[e.key]] = false;
  const button = document.getElementById('Btn'+keyMap[e.key]);
  if ( button ) button.classList.remove('active');
  e.preventDefault();
});

document.querySelectorAll('.keyboard button').forEach(b => {
  b.addEventListener('mousedown',  e => key(e.target.id, true));
  b.addEventListener('touchstart', e => key(e.target.id, true));
});

document.querySelectorAll('.keyboard button').forEach(b => {
  b.addEventListener('mouseup',   e => key(e.target.id, false));
  b.addEventListener('touchstop', e => key(e.target.id, false));
});

function key(id, state) {
  const index = id.substr(3);
  kbdState[index] = state;
}
