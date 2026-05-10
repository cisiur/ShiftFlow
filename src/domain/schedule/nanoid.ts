// Minimal ID generator — avoids adding the `nanoid` npm package for MVP.
const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

export function nanoid(size = 10): string {
  let id = '';
  for (let i = 0; i < size; i++) {
    id += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return id;
}
