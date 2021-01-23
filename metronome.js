function playBeat(audioCtx, destinationNode, buffer) {
  let source = audioCtx.createBufferSource();
  source.connect(destinationNode);
  source.buffer = buffer;
  source.start()
}

document.addEventListener('DOMContentLoaded', function () {
  let audioCtx = new AudioContext();
  let gain = audioCtx.createGain();
  gain.gain.setValueAtTime(0.05, audioCtx.currentTime)
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

  let startBtn = document.getElementById("startBtn");
  startBtn.addEventListener("click", function(){
    enabled = !enabled
    startBtn.innerHTML = enabled ? "Stop" : "Start";
    if (enabled) {
      playBeat(audioCtx, gain, buffer);
      metronomeInterval = setInterval(function(){
        playBeat(audioCtx, gain, buffer);
      }, 60000/60);
    } else {
      clearInterval(metronomeInterval);
    }
  });
});
