// src/services/gptService.js
import axios from 'axios';
import OpenAI from "openai";

const sendMessageToGPT = async (message, previousMessages, media = null) => {
  // Implement the logic to send the message to GPT and get a response
  // This is a placeholder, replace with actual GPT API integration
  console.log("Using key ", process.env.AIKey)
  console.log("Using Message ", message)
  try {
    const openai = new OpenAI({apiKey: process.env.AIKey});
    let messages = [...previousMessages, {role: "user", content: message}]
    if(media){
      messages = [...previousMessages, 
        {
          role: "user",
          content: [
            { type: "text", text: message },
            {
              type: "image_url",
              image_url:
                image,
            },
          ],
        },]
    }
    const completion = await openai.chat.completions.create({
      messages: messages,//[...previousMessages, {role: "user", content: message}],
      model: "gpt-4o",
    });

    console.log(completion);
    return completion
  }
  catch (error) {
    console.log("Error sending to gpt", error)
  }
};



async function SendToGpt() {
  const response = await openai.chat.completions.create({
    model: "gpt-4-turbo",
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: "What's in this image?" },
          {
            type: "image_url",
            image_url:
              "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Gfp-wisconsin-madison-the-nature-boardwalk.jpg/2560px-Gfp-wisconsin-madison-the-nature-boardwalk.jpg",
          },
        ],
      },
    ],
  });
  console.log(response.choices[0]);
}


export { sendMessageToGPT }