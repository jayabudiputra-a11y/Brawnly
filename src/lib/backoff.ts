export async function backoffRetry(fn: () => Promise<any>) {
  let delay = 1000;

  for (let i = 0; i < 6; i++) {
    try {
      return await fn();
    } catch {
      await new Promise(r => setTimeout(r, delay));
      delay *= 2;
    }
  }
}
