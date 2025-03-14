export function parseJsonResponse(text: string): any {
  try {
    if (text.includes("```json")) {
      return JSON.parse(text.replace("```json\n", "").replace("```", ""));
    }
    return JSON.parse(text);
  } catch (error) {
    throw new Error("Failed to parse JSON response");
  }
}

export function isValidQuestion(question: string): boolean {
  return typeof question === 'string' &&
    question.trim().length > 0 &&
    question.trim().length <= 1000;
}
