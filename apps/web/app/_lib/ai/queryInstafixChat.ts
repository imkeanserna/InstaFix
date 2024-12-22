import { IFetchPredictionResponse } from "@repo/types";
import { fetchPrediction } from "./fetchPrediction";

export const categories = {
  "Personal Services": [
    "Life Coach", "Psychologist", "Hairstylist", "Barber", "Makeup Artist", "Hairdresser", "Tailor", "Shoe Maker"
  ],
  "Technicians": [
    "Electrical Technician", "Electronics Technician", "IT Technician", "Mobile Repair Technician", "Appliance Technician", "Software Freelancer"
  ],
  "Mechanics": [
    "Bicycle Mechanic", "Auto Mechanic", "Motorcycle Mechanic", "Diesel Mechanic"
  ],
  "Transportation": [
    "Taxi Driver", "Bus Driver", "Courier", "Conductor", "Traffic Engineer"
  ],
  "Animal Care": [
    "Veterinarian", "Pet Groomer", "Dog Trainer", "Zookeeper", "Wildlife Biologist"
  ],
  "Sports and Recreation": [
    "Sports Instructor", "Professional Athlete", "Sports Coach", "Surfboard Shaper", "Surf Instructor", "Tennis Coach",
    "Soccer Coach", "Basketball Coach", "Football Coach", "Volleyball Coach", "Table Tennis Coach", "Rugby Coach",
    "Cricket Coach", "Golf Coach"
  ],
  "Creative Services": [
    "Interior Designer", "Furniture Designer", "Car Designer", "Event Caterer", "Bartender", "Chef"
  ],
  "Home and Garden": [
    "Gardener", "Horticulturist", "Plumber", "Carpenter", "Furniture Maker", "Painter"
  ]
}

export function generateInstaFixQuery(question: string): string {
  return `
    You are an assistant for InstaFix, a platform that connects users with trusted freelance professionals in various categories like plumbing, mechanics, computer repair, and health. 

    Message: "${question}"

    Guidelines: Please only select tags in this categories = ${JSON.stringify(categories)}
    1. Analyze the message to identify:
       - Any specific requirements (e.g., ratings, price range, location).
    2. Response always in JSON format following the format {
      tag: ["tag1", "tag2", ...],
      ratings: 0,
      location: null,
      price: 0,
      message: "message"
      }:
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

export function handleServiceDetectionQuery(query: string) {
  return `
I need to classify the problem/issue for the customer and find a professionals can fix it. Here are the categories and their professions:

categories = ${JSON.stringify(categories)}

Customer Problem/Issue: "Broken or have some issue on ${query}."

Return the list of relevant specific professions in JSON format only '{"Professions": []}'. Please select only on the categories else return null and Do not include any explanation.
    `;
}

export async function fetchAIResponse(query: string): Promise<IFetchPredictionResponse> {
  try {
    const response = await fetchPrediction(query);
    return response as IFetchPredictionResponse;
  } catch (error) {
    throw error;
  }
}
