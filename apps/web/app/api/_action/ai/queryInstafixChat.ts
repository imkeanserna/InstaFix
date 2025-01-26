import { IFetchPredictionResponse } from "@repo/types";
import { fetchChatGroq, fetchPrediction } from "./fetchPrediction";

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

export function generateInstaFixQuery(question: string, chatHistory: string): string {
  return `
    You are an assistant for InstaFix, a platform that connects users with trusted freelance professionals in various categories like plumbing, mechanics, computer repair, and health. 

    Previous conversation:
    ${chatHistory}

    Current message:: "${question}"

    Guidelines: Please only select tags in this categories = ${JSON.stringify(categories)}

1. Consider the chat history and current message to:
       - Understand the ongoing context and any previous requirements discussed
       - Maintain consistency with previous responses
       - Build upon information already shared
       - Identify any specific requirements (e.g., ratings, price range, location)

    2. Response always in JSON format following the format {
      tag: ["tag1", "tag2", ...],
      ratings: 0,
      location: null,
      price: 0,
      message: "message",
      shouldQuery: boolean,
      queryType: "FIND_PROFESSIONALS" | "PROVIDE_SOLUTION" | null
      }:
       - Tag: ["mechanic", "plumber", "computer_technician", "doctor"] If a professional type is specified, include it; otherwise, default to null.
       - Ratings: If a rating is specified, include it; otherwise, default to null.
       - Location: Extract location details if mentioned; otherwise, default to null.
       - Price: Extract price details if mentioned; otherwise, default to 0.
       - shouldQuery: Set to true when user is looking for professionals or needs specific service, false when just asking general questions.
       - queryType: Use "FIND_PROFESSIONALS" when need to search freelancers database, "PROVIDE_SOLUTION" when giving general advice, null for unrelated queries.
       - Message: Provide a conversational response that:
         - References relevant information from previous messages when appropriate
         - Maintains conversation continuity
         - If shouldQuery is true, end message with "Let me find the right professionals for you through InstaFix."
         - If shouldQuery is false but queryType is "PROVIDE_SOLUTION", provide helpful advice
         - If queryType is null, provide a general helpful response
         - Avoid mentioning database queries or availability checks

    Example responses:

    For professional search:
    {
      "tag": ["Plumber"],
      "ratings": 4,
      "location": "downtown",
      "price": 50,
      "message": "I understand you need a highly-rated plumber in downtown for your leaking pipe. Let me find the right professionals for you through InstaFix.",
      "shouldQuery": true,
      "queryType": "FIND_PROFESSIONALS"
    }

    For general advice:
    {
      "tag": ["Plumber"],
      "ratings": null,
      "location": null,
      "price": 0,
      "message": "For a minor pipe leak, you can temporarily stop it by turning off the main water supply and applying plumber's tape. However, for a proper fix, you'll need a professional. Would you like me to find a qualified plumber through InstaFix?",
      "shouldQuery": false,
      "queryType": "PROVIDE_SOLUTION"
    }

    For unrelated query:
    {
      "tag": null,
      "ratings": null,
      "location": null,
      "price": 0,
      "message": "I understand your question about gardening tips, but this isn't directly related to our services. Here's some general advice: [advice]",
      "shouldQuery": false,
      "queryType": null
    }
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
    const response = await fetchChatGroq(query);
    return response as IFetchPredictionResponse;
  } catch (error) {
    throw error;
  }
}
