export function initializeAppFactory(): () => Promise<any> {
  return () => new Promise<void>((resolve, _) => {
    resolve();
  });
}
