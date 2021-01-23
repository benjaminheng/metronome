class ScheduledNote {
  constructor(audioNode, time) {
    this.node = audioNode;
    this.time = time;
  }
}

class Metronome {
  constructor() {
    this.audioCtx = new AudioContext();
    this.gainNode = this.audioCtx.createGain();
    this.gainNode.connect(this.audioCtx.destination);

    this.scheduleFrequencyMS = 25;
    this.maxScheduleAheadTimeSeconds = 0.1;
    this.scheduledNotes = [];
    this.lastScheduledNoteTimeSeconds = 0;

    this.metronomeInterval = null;

    this.bpm = 60;
    this.volumeScale = 1.0;
  }

  scheduler() {
    if (this.lastScheduledNoteTimeSeconds < this.audioCtx.currentTime + this.maxScheduleAheadTimeSeconds) {
      const base = Math.max(this.lastScheduledNoteTimeSeconds, this.audioCtx.currentTime);
      const secondsPerBeat = 60/this.bpm;
      const nextTime = base + secondsPerBeat;
      this.scheduleNote(base + secondsPerBeat);
      this.lastScheduledNoteTimeSeconds = nextTime;
    }
  }

  start() {
    this.stop();
    this.metronomeInterval = setInterval(this.scheduler.bind(this), this.scheduleFrequencyMS);
  }

  stop() {
    this.removeScheduledNotes();
    if (this.metronomeInterval !== null) {
      clearInterval(this.metronomeInterval);
      this.metronomeInterval = null;
    }
  }

  isRunning() {
    return this.metronomeInterval !== null;
  }

  scheduleNote(time) {
    const oscillator = this.audioCtx.createOscillator();
    oscillator.frequency.value = 440;
    oscillator.connect(this.gainNode);
    oscillator.start(time);
    oscillator.stop(time + 0.1);
    this.scheduledNotes.push(new ScheduledNote(oscillator, time));
  }

  setVolume(volumePercent) {
    const volume = volumePercent / 100
    this.gainNode.gain.setValueAtTime(this.volumeScale*volume, this.audioCtx.currentTime)
  }

  removeScheduledNotes() {
    for (let i=0; i<this.scheduledNotes.length; i++) {
      try {
        this.scheduledNotes[i].node.disconnect(this.gainNode);
      } catch {}
    }
  }

  setBPM(bpm) {
    this.removeScheduledNotes();
    this.bpm = bpm;
    this.lastScheduledNoteTimeSeconds = 0;
  }
}

document.addEventListener('DOMContentLoaded', function () {
  const volumeSlider = document.getElementById("volumeSlider");
  const bpmInput = document.getElementById("bpmInput");
  const startBtn = document.getElementById("startBtn");

  const metronome = new Metronome();
  metronome.setVolume(volumeSlider.valueAsNumber)
  metronome.setBPM(bpmInput.valueAsNumber);

  startBtn.addEventListener("click", function(e){
    if (metronome.isRunning()) {
      metronome.stop();
    } else {
      metronome.start();
    }
    e.target.innerHTML = metronome.isRunning() ? "Stop" : "Start";
  });

  volumeSlider.addEventListener("input", function(e){
    metronome.setVolume(e.target.valueAsNumber)
    const volumeText = document.getElementById("volumeText");
    volumeText.innerHTML = e.target.value + "%";
  });

  bpmInput.addEventListener("input", function(e){
    if (e.target.valueAsNumber >= e.target.min && e.target.valueAsNumber <= e.target.max) {
      metronome.setBPM(e.target.valueAsNumber);
    }
  });
});
