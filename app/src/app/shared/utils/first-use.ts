export function isFirstAppUse(): boolean {
  const flag = localStorage.getItem('isFirstUse');
  const firstTime = flag === null;

  if (firstTime) {
    localStorage.setItem('isFirstUse', 'false');
  }

  return firstTime;
}
