export function generateTemporaryPassword(length = 12): string {
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lower = "abcdefghjkmnpqrstuvwxyz";
  const digits = "23456789";
  const special = "@#$!";
  const all = upper + lower + digits + special;

  const pick = (chars: string) => chars[Math.floor(Math.random() * chars.length)];

  const base = [pick(upper), pick(lower), pick(digits), pick(special)];
  while (base.length < length) {
    base.push(pick(all));
  }

  return base.sort(() => Math.random() - 0.5).join("");
}
