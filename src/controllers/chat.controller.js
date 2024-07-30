// src/controllers/chatController.js
import db from '../models/index.js';
import { sendMessageToGPT } from '../services/gptService.js';
import JWT from 'jsonwebtoken'

import fs from 'fs';
import path from 'path';
import { generateThumbnail, ensureDirExists } from '../utils/generateThumbnail.js';

const getRandomMessage = async () => {
  try {
    const randomMessage = await db.Message.findOne({
      where:{
        senderType: 'gpt'
      },
      order: db.sequelize.random(),
    });
    return randomMessage;
  } catch (error) {
    console.error('Error fetching random message:', error);
    throw error;
  }
};


const sendMessage = async (req, res) => {
  console.log("Send message API called");
  JWT.verify(req.token, process.env.SecretJwtKey, async (error, authData) => {
    if (authData) {


      const { content, chatId } = req.body;
      // let m1 = {
      //   content,
      //   senderType: 'user',
      //   chatId,
      //   userId: authData.user.id,
      //   image: null,
      //   imageThumb:  null,
      //   docUrl: null,
      //   tokens: 'promptTokens'
      // }

      // let mFromDb = await getRandomMessage();

      // let m2 = {
      //   content: "Hello this is response from gpt",
      //   senderType: 'gpt',
      //   chatId,
      //   image: null,
      //   imageThumb: null,
      //   docUrl: null,
      //   tokens: "completionTokens",
      //   finishReason: "gptResponse.finish_reason"
      // }


      // return res.status(200).json({ data: [m1, mFromDb], status: true, message: "message processed" });

      try {
        
        console.log(req.files)

        let image = null, thumbnail = null, doc = null;
        if (req.files.media) {
          let file = req.files.media[0];

          const mediaBuffer = file.buffer;
          const mediaType = file.mimetype;
          const mediaExt = path.extname(file.originalname);
          const mediaFilename = `${Date.now()}${mediaExt}`;
          console.log("There is a file uploaded")
          if (mediaType.includes('image')) {

            // Ensure directories exist
            let dir = process.env.DocsDir///var/www/neo/neoapis/uploads
            const imageDir = path.join(dir + '/images');;//path.join(__dirname, '../../uploads/images');
            const thumbnailDir = path.join(dir + '/thumbnails');;//path.join(__dirname, '../../uploads/thumbnails');
            ensureDirExists(imageDir);
            ensureDirExists(thumbnailDir);

            // Save image
            const imagePath = path.join(imageDir, mediaFilename);
            fs.writeFileSync(imagePath, mediaBuffer);
            // image = `/uploads/images/${mediaFilename}`;
            image = `https://www.blindcircle.com:444/neo/uploads/images/${mediaFilename}`;
            // Generate and save thumbnail
            const thumbnailBuffer = await generateThumbnail(mediaBuffer);
            const thumbnailFilename = `${Date.now()}_thumb${mediaExt}`;
            const thumbnailPath = path.join(thumbnailDir, thumbnailFilename);
            fs.writeFileSync(thumbnailPath, thumbnailBuffer);
            // thumbnail = `/uploads/thumbnails/${thumbnailFilename}`;
            thumbnail = `https://www.blindcircle.com:444/neo/uploads/thumbnails/${thumbnailFilename}`;

          } else {
            // Ensure directory exists
            const docDir = path.join('/var/www/neo/neoapis/uploads/documents');//path.join(__dirname, '../../uploads/documents');
            ensureDirExists(docDir);

            // Save document
            const docPath = path.join(docDir, mediaFilename);
            fs.writeFileSync(docPath, mediaBuffer);
            // doc = `/uploads/documents/${mediaFilename}`;
            doc = `https://www.blindcircle.com:444/neo/uploads/documents/${mediaFilename}`;
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

        const response = await sendMessageToGPT(content, previousMessages, image, chatId, chatId + `${Date().now}`);
        const gptResponse = response.choices[0];
        let promptTokens = response.usage.prompt_tokens;
        let completionTokens = response.usage.completion_tokens;

        console.log("Image ", image);
        console.log("Thumb", thumbnail);
        // return res.send({status: true, data: { image, thumbnail, doc}})
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





const getMessages = async (req, res) => {
  const chatId = req.query.chatId
  JWT.verify(req.token, process.env.SecretJwtKey, async (error, authData) => {
    if (authData) {
      let messages = await db.Message.findAll({
        where: {
          chatId: chatId,
          visibility: "visible"
        }
      })

      return res.json({ status: true, message: "messages list", data: messages });
    }
    else {
      res.json({ error: 'Server Error', status: false, message: "Unauthenticated user", data: null });
    }

  });

}



export { sendMessage, getMessages }