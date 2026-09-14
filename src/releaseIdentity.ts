function configuredIdentity(value: string | undefined): value is string {
  return typeof value === 'string'
    && value.trim().length > 0
    && !/replace-with|your[-_]|example/i.test(value);
}

export function androidApplicationIdSyntaxValid(value: string | undefined): boolean {
  return configuredIdentity(value) && /^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/.test(value);
}

export function iosBundleIdentifierSyntaxValid(value: string | undefined): boolean {
  return configuredIdentity(value) && /^[A-Za-z][A-Za-z0-9-]*(\.[A-Za-z][A-Za-z0-9-]*)+$/.test(value);
}

export function externalEvidenceBlockerOpen(
  syntaxValid: boolean,
  blockerDeclaredOpen: boolean,
): boolean {
  return !syntaxValid || blockerDeclaredOpen;
}
