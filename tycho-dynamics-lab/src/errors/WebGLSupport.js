export function getWebGLSupport() {
    if (
      typeof document ===
      "undefined"
    ) {
      return {
        supported: false,
        reason:
          "A browser environment is required.",
      };
    }
  
    try {
      const canvas =
        document.createElement(
          "canvas"
        );
  
      const context =
        canvas.getContext(
          "webgl2"
        ) ||
        canvas.getContext(
          "webgl"
        ) ||
        canvas.getContext(
          "experimental-webgl"
        );
  
      if (!context) {
        return {
          supported: false,
          reason:
            "WebGL is disabled or unavailable on this device.",
        };
      }
  
      const isWebGL2 =
        typeof WebGL2RenderingContext !==
          "undefined" &&
        context instanceof
          WebGL2RenderingContext;
  
      return {
        supported: true,
        webglVersion:
          isWebGL2 ? 2 : 1,
        reason: null,
      };
    } catch {
      return {
        supported: false,
        reason:
          "The browser could not create a WebGL rendering context.",
      };
    }
  }