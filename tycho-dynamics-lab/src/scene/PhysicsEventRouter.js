export function createPhysicsEventRouter(
    eventQueue
  ) {
    const listeners = new Set();
  
    function addListener(listener) {
      listeners.add(listener);
  
      return function removeListener() {
        listeners.delete(listener);
      };
    }
  
    function drain() {
      eventQueue.drainCollisionEvents(
        (handle1, handle2, started) => {
          for (const listener of listeners) {
            listener.handleCollisionEvent?.(
              handle1,
              handle2,
              started
            );
          }
        }
      );
  
      eventQueue.drainContactForceEvents(
        (event) => {
          for (const listener of listeners) {
            listener.handleContactForceEvent?.(
              event
            );
          }
        }
      );
    }
  
    function clear() {
      listeners.clear();
    }
  
    return {
      addListener,
      drain,
      clear,
    };
  }