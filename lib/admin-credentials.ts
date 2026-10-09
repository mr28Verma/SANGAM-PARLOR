/** Compare credentials on the server without transforming either value. */
export function verifyAdminPassword(submittedPassword: string, configuredPassword: string | undefined): boolean {
  return typeof configuredPassword === "string" && configuredPassword.length > 0 && submittedPassword === configuredPassword;
}
