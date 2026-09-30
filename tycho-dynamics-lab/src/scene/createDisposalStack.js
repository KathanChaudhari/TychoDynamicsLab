export function createDisposalStack() {
  const disposers = [];
  let disposed = false;

  function add(disposer) {
    if (disposed) {
      disposer();
      return disposer;
    }

    disposers.push(disposer);
    return disposer;
  }

  function dispose() {
    if (disposed) {
      return;
    }

    disposed = true;

    for (let index = disposers.length - 1; index >= 0; index -= 1) {
      try {
        disposers[index]();
      } catch (error) {
        console.error("Simulation cleanup failed:", error);
      }
    }

    disposers.length = 0;
  }

  return {
    add,
    dispose,
    get disposed() {
      return disposed;
    },
  };
}
