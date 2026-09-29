export function createNotificationAudio({
    context,
    destination,
  }) {
    function playTone({
      frequency,
      endFrequency = frequency,
      duration = 0.15,
      volume = 0.12,
      type = "sine",
      delay = 0,
    }) {
      const oscillator =
        context.createOscillator();
  
      const gain =
        context.createGain();
  
      const start =
        context.currentTime + delay;
  
      const end =
        start + duration;
  
      oscillator.type = type;
  
      oscillator.frequency
        .setValueAtTime(
          Math.max(frequency, 1),
          start
        );
  
      oscillator.frequency
        .exponentialRampToValueAtTime(
          Math.max(endFrequency, 1),
          end
        );
  
      gain.gain.setValueAtTime(
        0.0001,
        start
      );
  
      gain.gain
        .exponentialRampToValueAtTime(
          volume,
          start + 0.02
        );
  
      gain.gain
        .exponentialRampToValueAtTime(
          0.0001,
          end
        );
  
      oscillator.connect(gain);
      gain.connect(destination);
  
      oscillator.start(start);
      oscillator.stop(end + 0.02);
  
      oscillator.addEventListener(
        "ended",
        () => {
          oscillator.disconnect();
          gain.disconnect();
        }
      );
    }
  
    function playImpact(
      impactForce,
      crashForce
    ) {
      const ratio =
        Math.min(
          impactForce /
            Math.max(crashForce, 1),
          1
        );
  
      const duration =
        0.12 + ratio * 0.32;
  
      const bufferLength =
        Math.floor(
          context.sampleRate *
            duration
        );
  
      const buffer =
        context.createBuffer(
          1,
          bufferLength,
          context.sampleRate
        );
  
      const data =
        buffer.getChannelData(0);
  
      for (
        let index = 0;
        index < bufferLength;
        index += 1
      ) {
        const progress =
          index / bufferLength;
  
        data[index] =
          (Math.random() * 2 - 1) *
          (1 - progress);
      }
  
      const source =
        context.createBufferSource();
  
      const filter =
        context.createBiquadFilter();
  
      const gain =
        context.createGain();
  
      source.buffer = buffer;
  
      filter.type = "lowpass";
  
      filter.frequency.value =
        250 + ratio * 800;
  
      gain.gain.value =
        0.08 + ratio * 0.32;
  
      source.connect(filter);
      filter.connect(gain);
      gain.connect(destination);
  
      source.start();
  
      source.addEventListener(
        "ended",
        () => {
          source.disconnect();
          filter.disconnect();
          gain.disconnect();
        }
      );
    }
  
    function sensorAcquired() {
      playTone({
        frequency: 520,
        endFrequency: 720,
        duration: 0.16,
        volume: 0.1,
      });
    }
  
    function warning(delay = 0) {
      playTone({
        frequency: 240,
        duration: 0.12,
        volume: 0.13,
        type: "square",
        delay,
      });
  
      playTone({
        frequency: 190,
        duration: 0.14,
        volume: 0.13,
        type: "square",
        delay: delay + 0.16,
      });
    }
  
    function capture() {
      playTone({
        frequency: 360,
        endFrequency: 580,
        duration: 0.28,
        volume: 0.12,
        type: "triangle",
      });
    }
  
    function docked() {
      playTone({
        frequency: 440,
        duration: 0.16,
        volume: 0.12,
      });
  
      playTone({
        frequency: 660,
        duration: 0.18,
        volume: 0.12,
        delay: 0.16,
      });
  
      playTone({
        frequency: 880,
        duration: 0.3,
        volume: 0.14,
        delay: 0.34,
      });
    }
  
    function missionSuccess() {
      docked();
    }
  
    function missionFailure() {
      playTone({
        frequency: 320,
        endFrequency: 120,
        duration: 0.55,
        volume: 0.18,
        type: "sawtooth",
      });
    }
  
    return {
      sensorAcquired,
      warning,
      capture,
      docked,
      missionSuccess,
      missionFailure,
      playImpact,
    };
  }