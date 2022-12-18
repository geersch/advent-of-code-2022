export function getProcessingTime(time: [number, number]) {
  return `${(time[0] * 1000 + time[1] / 1e6).toFixed(2)}ms`;
}
