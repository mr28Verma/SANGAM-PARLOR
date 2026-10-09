import bcrypt from "bcryptjs";

const bcryptHashPattern = /^\$2[aby]\$(?:0[4-9]|[12]\d|3[01])\$[./A-Za-z0-9]{53}$/;

export function isBcryptHash(value: string): boolean {
  return bcryptHashPattern.test(value);
}

export async function verifyAdminPassword(password: string, passwordHash: string): Promise<boolean> {
  if (!isBcryptHash(passwordHash)) return false;
  return bcrypt.compare(password, passwordHash);
}
