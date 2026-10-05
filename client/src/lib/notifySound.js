const SOUND_URL = "/jai-mata-di.mp3";
let audio;
let lastPlayed = 0;

const getAudio = () => {
  if (!audio) {
    audio = new Audio(SOUND_URL);
    audio.preload = "auto";
    audio.volume = 0.8;
  }
  return audio;
};

// Browsers block sound until the first tap. Play silently once so later sounds are allowed.
export const unlockAudio = () => {
  const a = getAudio();
  a.muted = true;
  a.play()
    .then(() => {
      a.pause();
      a.currentTime = 0;
      a.muted = false;
    })
    .catch(() => {
      a.muted = false;
    });
};

// Same notification can arrive by push and by the list, so skip repeats within 3 seconds
export const playNotifySound = () => {
  const now = Date.now();
  if (now - lastPlayed < 3000) return;
  lastPlayed = now;
  const a = getAudio();
  a.currentTime = 0;
  a.play().catch(() => {});
  navigator.vibrate?.(200);
};