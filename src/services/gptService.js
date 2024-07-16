// src/services/gptService.js
import axios from 'axios';
import OpenAI from "openai";

const sendMessageToGPT = async (message, previousMessages) => {
  // Implement the logic to send the message to GPT and get a response
  // This is a placeholder, replace with actual GPT API integration
  console.log("Using key ", process.env.AIKey)
  console.log("Using Message ", message)
  try {
    const openai = new OpenAI({apiKey: process.env.AIKey});
    const completion = await openai.chat.completions.create({
      messages: [...previousMessages, {role: "user", content: message}],
      model: "gpt-4o",
    });

    console.log(completion);
    return completion
  }
  catch (error) {
    console.log("Error sending to gpt", error)
  }
};

export { sendMessageToGPT }