// src/services/gptService.js
import axios from 'axios';

const sendMessageToGPT = async (message) => {
  // Implement the logic to send the message to GPT and get a response
  // This is a placeholder, replace with actual GPT API integration
  console.log("Using key ", process.env.AIKey)
  try{
    return axios.post('https://api.openai.com/v1/engines/davinci-codex/completions', {
      prompt: message,
      max_tokens: 150
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.AIKey}`
      }
    }).then(response => response.data.choices[0].text);
  }
  catch(error){
    console.log("Error sending to gpt", error)
  }
};

export {sendMessageToGPT}