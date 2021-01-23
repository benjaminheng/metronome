function playBeat(audioCtx, destinationNode, buffer) {
  let source = audioCtx.createBufferSource();
  source.connect(destinationNode);
  source.buffer = buffer;
  source.start()
}

function setVolume(audioCtx, gainNode, volumePercent) {
  const maxVolume = 0.2;
  const volume = volumePercent / 100
  gainNode.gain.setValueAtTime(maxVolume*volume, audioCtx.currentTime)
  let volumeText = document.getElementById("volumeText");
  volumeText.innerHTML = volumePercent.toString() + "%";
}

document.addEventListener('DOMContentLoaded', function () {
  let volumeSlider = document.getElementById("volumeSlider");
  const startBtn = document.getElementById("startBtn");

  let audioCtx = new AudioContext();
  let gain = audioCtx.createGain();
  setVolume(audioCtx, gain, volumeSlider.valueAsNumber);
  gain.connect(audioCtx.destination);

  let beatLength = 0.1; // 100ms
  let buffer = audioCtx.createBuffer(1, beatLength*audioCtx.sampleRate, audioCtx.sampleRate);

  // fill buffer with white noise
  let bufferData = buffer.getChannelData(0);
  for (let i=0; i<buffer.length; i++) {
    bufferData[i] = Math.random() * 2 - 1; // [-1.0; 1.0]
  }

  const bpm = 60;
  let metronomeInterval;
  let enabled = false;

  startBtn.addEventListener("click", function(e){
    enabled = !enabled
    e.target.innerHTML = enabled ? "Stop" : "Start";
    if (enabled) {
      playBeat(audioCtx, gain, buffer);
      metronomeInterval = setInterval(function(){
        playBeat(audioCtx, gain, buffer);
      }, 60000/60);
    } else {
      clearInterval(metronomeInterval);
    }
  });

  volumeSlider.addEventListener("input", function(e){
    setVolume(audioCtx, gain, e.target.valueAsNumber)
  });
});
