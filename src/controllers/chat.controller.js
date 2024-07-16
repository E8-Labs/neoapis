// src/controllers/chatController.js
import db from '../models/index.js';
import { sendMessageToGPT } from '../services/gptService.js';
import JWT from 'jsonwebtoken'

const sendMessage = async (req, res) => {
  JWT.verify(req.token, process.env.SecretJwtKey, async (error, authData) => {
    if (authData) {
      try {
        // const { chatId } = req.params;
        const { content, chatId } = req.body;
        
        let previousMessages = []

        let messages = await db.Message.findAll({
          where: {
            chatId: chatId
          }
        })
        if(messages && messages.length > 0){
          console.log("We have previous messages")
          messages.map((item)=>{
            let m = {content: item.content, role: item.senderType == "user" ? "user" : "system"}
            previousMessages.push(m)
          })
        }

        console.log("Sending previous messages", previousMessages)
        const response = await sendMessageToGPT(content, previousMessages);
        const gptResponse = response.choices[0]

        let promptTokens = response.usage.prompt_tokens
        let completionTokens = response.usage.completion_tokens


        const message = await db.Message.create({ content, senderType: 'user', chatId, userId: authData.user.id, image: null, tokens: promptTokens });
        console.log("Gpt respones ", gptResponse)
        const gptMessage = await db.Message.create({ content: gptResponse.message.content, senderType: 'gpt', 
          chatId, image: null, tokens: completionTokens, finishReason: gptResponse.finish_reason });

        res.status(200).json({ data: [message, gptMessage], status: true, message: "message processed" });
      } catch (error) {
        res.status(500).json({ error: 'Server Error', status: false, message: error.message, data: null });
      }
    }
  })

};


export { sendMessage }