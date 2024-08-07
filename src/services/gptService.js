// src/services/gptService.js
import axios from 'axios';
import OpenAI from "openai";
import { Pinecone } from '@pinecone-database/pinecone';

const openai = new OpenAI({ apiKey: process.env.AIKey });

const pineconeClient = new Pinecone({
  apiKey: process.env.PineConeApiKey
});

const indexName = 'chat-context';

(async () => {
  

  const existingIndexes = await pineconeClient.listIndexes();
  const indexNames = existingIndexes.indexes.map(index => index.name);
  console.log("Existing", indexNames)
  if (indexNames.length > 0 && indexNames.includes(indexName)) {
    
  }
  else{
    await pineconeClient.createIndex({
      name: indexName,
      dimension: 1536, // OpenAI embedding dimension
      metric: 'euclidean', // Replace with your model metric
      spec: { 
          serverless: { 
              cloud: 'aws', 
              region: 'us-east-1' 
          }
      } 
    });
  }
})();

const sendMessageToGPT = async (message, previousMessages, media = null, chatId = 1, messageId = 1) => {
  // Implement the logic to send the message to GPT and get a response
  // This is a placeholder, replace with actual GPT API integration
  console.log("Using key ", process.env.AIKey)
  console.log("Using chatid ", chatId)

  try {

    const contexts = await FindContext(message, chatId, messageId) || "";
    let history = ""
    if(contexts.length > 0){
      history = contexts.join('\n');
    }
    console.log("Context is ", history)
    // return 
    // let messages = [{role: "system", content: history, type: "history"}, { role: "user", content: message }]
    let messages = [...previousMessages, { role: "user", content: message }]
    if (media) {
      messages = [...previousMessages,
      {
        role: "user",
        content: [
          { type: "text", text: message },
          {
            type: "image_url",
            image_url: {
              url: media,
            }

          },
        ],
      },]
    }
    console.log("Messages sent to gpt ", messages)
    const completion = await openai.chat.completions.create({
      messages: messages,//[...previousMessages, {role: "user", content: message}],
      model: "gpt-4o",
    });

    const newMessageId = Date.now(); // Or use a more robust unique ID generator
    
    messages.push({role: "system", content: completion.choices[0]})
    const newContext = JSON.stringify(JSON.stringify([{ role: "user", content: message }, {role: "system", content: completion.choices[0]}]));


    let saved = await ConvertAndStoreEmbeddings(newContext, chatId)

    console.log(completion);
    return completion
  }
  catch (error) {
    console.log("Error sending to gpt", error)
  }
};




const ConvertAndStoreEmbeddings = async (text, chatId, messageId) => {
  // Create Pinecone index
  console.log("Storing context embeddings", chatId)
  try{
    
  
    const embedding = await getEmbedding(text);
    const index = pineconeClient.Index('chat-context');
      await index.upsert(
          [
            {
              id: `${chatId}-${Date.now()}`,
              values: embedding,
              metadata: { chatId, text },
            },
          ],
      );
      return true
  }
  catch(error){
    console.log("Embeddings store error ", error)
    return null
  }
}

const FindContext = async (query, chatId, messageId) => {
  try {
    // const { chatId, query } = req.body;
    const queryEmbedding = await getEmbedding(query);
    const index = pineconeClient.Index('chat-context');
    const searchResults = await index.query({
      
        topK: 5,
        vector: queryEmbedding,
        includeMetadata: true,
        filter: {
          chatId: chatId,
        },
    });
    console.log("QUERY IS ", query)
console.log('Comtext Result', searchResults)
    const contextTexts = searchResults.matches.map((match) => match.metadata.text);
    return contextTexts
  } catch (error) {
    console.log("Error finding context ", error)
    return null
  }
}





const getEmbedding = async (text) => {
  const response = await openai.embeddings.create({
    model: 'text-embedding-ada-002',
    input: text,
    encoding_format: "float",
  });
  console.log("Embeddings response ", response)
  return response.data[0].embedding;
};

export { sendMessageToGPT }