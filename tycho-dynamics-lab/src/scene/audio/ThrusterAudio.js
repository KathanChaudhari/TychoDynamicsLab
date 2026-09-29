export function createThrusterAudio({
    context,
    destination,
  }) {
    const output =
      context.createGain();
  
    output.gain.value = 0;
    output.connect(destination);
  
    const oscillator =
      context.createOscillator();
  
    oscillator.type = "sawtooth";
    oscillator.frequency.value = 55;
  
    const oscillatorFilter =
      context.createBiquadFilter();
  
    oscillatorFilter.type =
      "lowpass";
  
    oscillatorFilter.frequency.value =
      280;
  
    const oscillatorGain =
      context.createGain();
  
    oscillatorGain.gain.value = 0.25;
  
    oscillator.connect(
      oscillatorFilter
    );
  
    oscillatorFilter.connect(
      oscillatorGain
    );
  
    oscillatorGain.connect(output);
  
    const noiseLength =
      context.sampleRate * 2;
  
    const noiseBuffer =
      context.createBuffer(
        1,
        noiseLength,
        context.sampleRate
      );
  
    const noiseData =
      noiseBuffer.getChannelData(0);
  
    for (
      let index = 0;
      index < noiseLength;
      index += 1
    ) {
      noiseData[index] =
        Math.random() * 2 - 1;
    }
  
    const noiseSource =
      context.createBufferSource();
  
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;
  
    const noiseFilter =
      context.createBiquadFilter();
  
    noiseFilter.type = "bandpass";
    noiseFilter.frequency.value = 420;
    noiseFilter.Q.value = 0.8;
  
    const noiseGain =
      context.createGain();
  
    noiseGain.gain.value = 0.12;
  
    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(output);
  
    oscillator.start();
    noiseSource.start();
  
    function getDemand(
      controlState
    ) {
      const translation =
        controlState.translation;
  
      const rotation =
        controlState.rotation;
  
      return (
        Math.abs(translation.x) +
        Math.abs(translation.y) +
        Math.abs(translation.z) +
        Math.abs(rotation.x) *
          0.45 +
        Math.abs(rotation.y) *
          0.45 +
        Math.abs(rotation.z) *
          0.45
      );
    }
  
    function update(
      controlState,
      active
    ) {
      const demand = active
        ? getDemand(controlState)
        : 0;
  
      const intensity =
        Math.min(demand / 1.8, 1);
  
      const now =
        context.currentTime;
  
      output.gain.cancelScheduledValues(
        now
      );
  
      output.gain.setTargetAtTime(
        intensity * 0.18,
        now,
        intensity > 0
          ? 0.035
          : 0.08
      );
  
      oscillator.frequency
        .setTargetAtTime(
          50 + intensity * 28,
          now,
          0.06
        );
  
      noiseFilter.frequency
        .setTargetAtTime(
          350 + intensity * 500,
          now,
          0.06
        );
    }
  
    function stop() {
      const now =
        context.currentTime;
  
      output.gain.setTargetAtTime(
        0,
        now,
        0.03
      );
    }
  
    function dispose() {
      oscillator.stop();
      noiseSource.stop();
  
      oscillator.disconnect();
      oscillatorFilter.disconnect();
      oscillatorGain.disconnect();
  
      noiseSource.disconnect();
      noiseFilter.disconnect();
      noiseGain.disconnect();
  
      output.disconnect();
    }
  
    return {
      update,
      stop,
      dispose,
    };
  }