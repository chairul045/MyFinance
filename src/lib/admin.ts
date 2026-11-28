export const DEFAULT_ADMIN_EMAILS = [
  'chairulanwarr003@gmail.com',
];

export function getAdminEmails(): string[] {
  const envEmails = process.env.ADMIN_WHITELIST_EMAILS || process.env.ADMIN_EMAILS || '';
  const parsed = envEmails
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  const combined = new Set([...DEFAULT_ADMIN_EMAILS.map((e) => e.toLowerCase()), ...parsed]);
  return Array.from(combined);
}

export function isUserAdmin(email?: string | null): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  const admins = getAdminEmails();
  return admins.includes(normalized);
}
