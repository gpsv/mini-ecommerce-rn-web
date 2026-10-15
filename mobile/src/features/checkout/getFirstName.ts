/** "María López" → "María", for the confirmation greeting. */
export function getFirstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] ?? '';
}
