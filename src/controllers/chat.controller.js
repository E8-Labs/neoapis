// src/controllers/chatController.js
import db from '../models/index.js';
import { sendMessageToGPT } from '../services/gptService.js';
import JWT from 'jsonwebtoken'

import fs from 'fs';
import path from 'path';
import  {generateThumbnail}  from '../utils/generateThumbnail.js';
import { fileURLToPath } from 'url';

// Define __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const ensureDirExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

const sendMessage = async (req, res) => {
  console.log("Send message API called");
  JWT.verify(req.token, process.env.SecretJwtKey, async (error, authData) => {
    if (authData) {
      try {
        const { content, chatId } = req.body;
        let file = req.file;
        let image = null, thumbnail = null, doc = null;

        if (file) {
          const mediaBuffer = file.buffer;
          const mediaType = file.mimetype;
          const mediaExt = path.extname(file.originalname);
          const mediaFilename = `${Date.now()}${mediaExt}`;

          if (mediaType.includes('image')) {
            // Ensure directories exist
            const imageDir = path.join(__dirname, '../../uploads/images');
            const thumbnailDir = path.join(__dirname, '../../uploads/thumbnails');
            ensureDirExists(imageDir);
            ensureDirExists(thumbnailDir);
            
            // Save image
            const imagePath = path.join(imageDir, mediaFilename);
            fs.writeFileSync(imagePath, mediaBuffer);
            image = `/uploads/images/${mediaFilename}`;

            // Generate and save thumbnail
            const thumbnailBuffer = await generateThumbnail(mediaBuffer);
            const thumbnailFilename = `${Date.now()}_thumb${mediaExt}`;
            const thumbnailPath = path.join(thumbnailDir, thumbnailFilename);
            fs.writeFileSync(thumbnailPath, thumbnailBuffer);
            thumbnail = `/uploads/thumbnails/${thumbnailFilename}`;
          } else {
            // Ensure directory exists
            const docDir = path.join(__dirname, '../../uploads/documents');
            ensureDirExists(docDir);

            // Save document
            const docPath = path.join(docDir, mediaFilename);
            fs.writeFileSync(docPath, mediaBuffer);
            doc = `/uploads/documents/${mediaFilename}`;
          }
        }

        let previousMessages = [];
        let messages = await db.Message.findAll({
          where: { chatId: chatId }
        });

        if (messages && messages.length > 0) {
          messages.map((item) => {
            let m = { content: item.content, role: item.senderType == "user" ? "user" : "system" };
            previousMessages.push(m);
          });
        }

        const response = await sendMessageToGPT(content, previousMessages);
        const gptResponse = response.choices[0];
        let promptTokens = response.usage.prompt_tokens;
        let completionTokens = response.usage.completion_tokens;

        console.log("Image saved ", image);
        console.log("Thumb saved ", thumbnail);
        const message = await db.Message.create({
          content,
          senderType: 'user',
          chatId,
          userId: authData.user.id,
          image: image || null,
          imageThumb: thumbnail || null,
          docUrl: doc || null,
          tokens: promptTokens
        });

        const gptMessage = await db.Message.create({
          content: gptResponse.message.content,
          senderType: 'gpt',
          chatId,
          image: null,
          imageThumb: null,
          docUrl: null,
          tokens: completionTokens,
          finishReason: gptResponse.finish_reason
        });

        res.status(200).json({ data: [message, gptMessage], status: true, message: "message processed" });
      } catch (error) {
        console.error("Error processing message:", error);
        res.status(500).json({ error: 'Server Error', status: false, message: error.message, data: null });
      }
    } else {
      res.status(401).json({ error: 'Unauthorized', status: false, message: 'Invalid token', data: null });
    }
  });
};

// const sendMessage = async (req, res) => {
//   JWT.verify(req.token, process.env.SecretJwtKey, async (error, authData) => {
//     if (authData) {
//       try {
//         // const { chatId } = req.params;
//         const { content, chatId } = req.body;
//         let files = req.files;
//         let image = null, thumbnail = null, doc = null;
//         if (files.media) {
//           const mediaBuffer = files.media[0].buffer;
//           const mediaType = files.media[0].mimetype;
//           if (mediaType.includes('image')) {

//           }
//           else{

//           }
//         }
        
        
//         let previousMessages = []

//         let messages = await db.Message.findAll({
//           where: {
//             chatId: chatId
//           }
//         })
//         if(messages && messages.length > 0){
//           console.log("We have previous messages")
//           messages.map((item)=>{
//             let m = {content: item.content, role: item.senderType == "user" ? "user" : "system"}
//             previousMessages.push(m)
//           })
//         }

        

//         console.log("Sending previous messages", previousMessages)
//         const response = await sendMessageToGPT(content, previousMessages);
//         const gptResponse = response.choices[0]

//         let promptTokens = response.usage.prompt_tokens
//         let completionTokens = response.usage.completion_tokens


//         const message = await db.Message.create({ content, senderType: 'user', chatId, userId: authData.user.id, image: null, tokens: promptTokens });
//         console.log("Gpt respones ", gptResponse)
//         const gptMessage = await db.Message.create({ content: gptResponse.message.content, senderType: 'gpt', 
//           chatId, image: null, tokens: completionTokens, finishReason: gptResponse.finish_reason });

//         res.status(200).json({ data: [message, gptMessage], status: true, message: "message processed" });
//       } catch (error) {
//         res.status(500).json({ error: 'Server Error', status: false, message: error.message, data: null });
//       }
//     }
//   })

// };



const getMessages = async (req, res) => {
  const {chatId} = req.body
  JWT.verify(req.token, process.env.SecretJwtKey, async (error, authData) => {
    if (authData) {
      let messages = await db.Message.findAll({
        where: {
          chatId: chatId
        }
      })

      return res.json({ status: true, message: "messages list", data: messages });
    }
    else{
      res.json({ error: 'Server Error', status: false, message: "Unauthenticated user", data: null });
    }

  });

}



export { sendMessage, getMessages }