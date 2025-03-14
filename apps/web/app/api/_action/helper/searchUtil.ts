export function sanitizeSearchQuery(query: string): string {
  return query
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, '') // Remove special characters
    .trim()
    .substring(0, 100); // Limit to 100 characters
}
