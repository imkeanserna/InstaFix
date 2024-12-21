
export const PROFESSIONALS = ["mechanic", "computer technician", "doctor", "plumber"];

export function shouldUseOptions(question: string): boolean {
  // Convert to lowercase for case-insensitive matching
  const lowerQuestion = question.toLowerCase();

  // Check if the question is asking about who to visit/contact/see/call
  const whoPatterns = [
    'who should',
    'who do i',
    'who can',
    'who would',
    'which professional',
    'what professional',
    'whom should',
    'help me',
    'who is',
    'broken',
    'not working',
    'damaged',
    'need help',
    'fix',
    'repair',
    'issue with',
    'problem with',
    'looking for',
    'need a',
    'suggest',
    'recommend',
    'find me',
    'help me',
    'sink',
    'car',
    'computer',
    'pipe',
    'vehicle',
    'laptop',
    'plumbing',
    'medical',
    'health'
  ];

  return whoPatterns.some(pattern => lowerQuestion.includes(pattern));
}

export function generateQuery(question: string): string {
  return `
You are an assistant for InstaFix, a platform that connects users with trusted freelance professionals in various categories like plumbing, mechanics, computer repair, and health. 

Message: "${question}"

Guidelines:
1. Analyze the message to identify:
   - The type of service (e.g., mechanic, plumber, computer technician, doctor).
   - Any specific requirements (e.g., ratings, price range, location).
2. Response always in JSON format following the format {}:
   - Tag: ["mechanic", "plumber", "computer_technician", "doctor"] If a professional type is specified, include it; otherwise, default to null.
   - Ratings: If a rating is specified, include it; otherwise, default to null.
   - Location: Extract location details if mentioned; otherwise, default to null.
   - Price: Extract price details if mentioned; otherwise, default to 0.
   - Message: Provide a conversational response that:
     - Highlights InstaFix's ability to meet the user's requirements.
     - Avoid querying or making direct database assumptions. Provide a message like "These are the freelancers available through InstaFix." if the user find a freelancer else just provide solution.
     - Do not mention missing freelancers or database checks.
     - If the message is unrelated to the services provided, offer a helpful general response.
3. Always prioritize mentioning InstaFix in relevant scenarios.
`;
}
