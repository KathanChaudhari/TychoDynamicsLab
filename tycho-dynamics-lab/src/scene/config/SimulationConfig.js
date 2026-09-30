function readDebugMode() {
  if (typeof window === "undefined") {
    return false;
  }

  return new URLSearchParams(window.location.search).get("debug") === "true";
}

const devicePixelRatio =
  typeof window === "undefined" ? 1 : window.devicePixelRatio || 1;

export const SIMULATION_CONFIG = Object.freeze({
  debug: readDebugMode(),
  performance: {
    sampleInterval: 0.5,
    adaptiveQuality: true,
    minimumPixelRatio: 0.75,
    maximumPixelRatio: Math.min(devicePixelRatio, 2),
    pixelRatioStep: 0.25,
    lowFPSThreshold: 45,
    highFPSThreshold: 57,
    downgradeDelay: 3,
    upgradeDelay: 8,
  },
});
