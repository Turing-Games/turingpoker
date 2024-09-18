export function lexicoCompare(a: number[], b: number[]): number {
  for (let i = 0; i < a.length; i++) {
    if (a[i] < b[i]) return -1;
    if (a[i] > b[i]) return 1;
  }
  return 0;
}

export function isAction(action: unknown): action is Action {
  if (typeof action != 'object' || action == null) return false;
  if (!('type' in action)) return false;
  if (typeof action['type'] != 'string') return false;
  if (action['type'] == 'raise') {
    if (!('amount' in action)) return false;
    if (typeof action['amount'] != 'number') return false;
  }
  return true;
}