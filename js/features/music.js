function getAudio() {
  return document.getElementById('bgMusic');
}

export function toggleMusic() {
  const audio = getAudio();
  if (!audio) return;
  if (audio.paused) audio.play();
  else audio.pause();
}

export function setVolume(value) {
  const audio = getAudio();
  if (audio) audio.volume = value / 100;
}

export function initMusicControls() {
  document.querySelectorAll('[data-music-toggle]').forEach(btn => {
    btn.addEventListener('click', toggleMusic);
  });
  document.querySelectorAll('[data-volume]').forEach(slider => {
    slider.addEventListener('input', e => setVolume(e.target.value));
    const audio = getAudio();
    if (audio) audio.volume = slider.value / 100;
  });
}