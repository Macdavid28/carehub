import * as Brevo from "@getbrevo/brevo";
import dotenv from "dotenv";

dotenv.config({ path: "../.env" });

export const transactionalEmailsApi = new Brevo.TransactionalEmailsApi();

// Configure API key authorization: api-key
const apiKey = transactionalEmailsApi.authentications["apiKey"];
apiKey.apiKey = process.env.BREVO_API_KEY;

console.log(
  "Brevo API Key Loaded:",
  process.env.BREVO_API_KEY
    ? "YES (" + process.env.BREVO_API_KEY.substring(0, 5) + "...)"
    : "NO",
);

export const sender = { email: process.env.BREVO_EMAIL, name: "CareHub" }; // Using a default sender, user should update this
