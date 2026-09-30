function clamp(value, minimum, maximum) {
  return Math.min(Math.max(value, minimum), maximum);
}

export function createPerformanceSystem({
  renderer,
  resizeRenderer,
  configuration,
  onUpdate,
}) {
  const {
    sampleInterval,
    adaptiveQuality,
    minimumPixelRatio,
    maximumPixelRatio,
    pixelRatioStep,
    lowFPSThreshold,
    highFPSThreshold,
    downgradeDelay,
    upgradeDelay,
  } = configuration;

  let currentPixelRatio = clamp(
    renderer.getPixelRatio(),
    minimumPixelRatio,
    maximumPixelRatio
  );
  let elapsedSampleTime = 0;
  let sampledFrames = 0;
  let accumulatedFrameTime = 0;
  let lowFPSDuration = 0;
  let highFPSDuration = 0;

  function resetSamples() {
    elapsedSampleTime = 0;
    sampledFrames = 0;
    accumulatedFrameTime = 0;
  }

  function setPixelRatio(nextPixelRatio) {
    const clampedPixelRatio = clamp(
      nextPixelRatio,
      minimumPixelRatio,
      maximumPixelRatio
    );

    if (Math.abs(clampedPixelRatio - currentPixelRatio) < 0.01) {
      return;
    }

    currentPixelRatio = clampedPixelRatio;
    resizeRenderer(currentPixelRatio);
  }

  function updateAdaptiveQuality(fps, interval) {
    if (!adaptiveQuality) {
      return;
    }

    if (fps < lowFPSThreshold) {
      lowFPSDuration += interval;
      highFPSDuration = 0;
    } else if (fps > highFPSThreshold) {
      highFPSDuration += interval;
      lowFPSDuration = 0;
    } else {
      lowFPSDuration = 0;
      highFPSDuration = 0;
    }

    if (lowFPSDuration >= downgradeDelay) {
      setPixelRatio(currentPixelRatio - pixelRatioStep);
      lowFPSDuration = 0;
    }

    if (highFPSDuration >= upgradeDelay) {
      setPixelRatio(currentPixelRatio + pixelRatioStep);
      highFPSDuration = 0;
    }
  }

  function publish(fps, frameTime) {
    const { render, memory } = renderer.info;

    onUpdate?.({
      fps,
      frameTime,
      pixelRatio: currentPixelRatio,
      drawCalls: render.calls,
      triangles: render.triangles,
      points: render.points,
      lines: render.lines,
      geometries: memory.geometries,
      textures: memory.textures,
    });
  }

  function beginFrame(frameTime) {
    elapsedSampleTime += frameTime;
    accumulatedFrameTime += frameTime;
    sampledFrames += 1;
  }

  function afterRender() {
    if (elapsedSampleTime < sampleInterval) {
      return;
    }

    const fps = sampledFrames / elapsedSampleTime;
    const frameTime = (accumulatedFrameTime / sampledFrames) * 1000;

    updateAdaptiveQuality(fps, elapsedSampleTime);
    publish(fps, frameTime);
    resetSamples();
  }

  function reset() {
    resetSamples();
    lowFPSDuration = 0;
    highFPSDuration = 0;
  }

  function dispose() {
    reset();
    onUpdate?.(null);
  }

  return {
    beginFrame,
    afterRender,
    reset,
    dispose,
    getPixelRatio: () => currentPixelRatio,
  };
}
