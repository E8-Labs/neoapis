import sharp from 'sharp'; // For image processing
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
// import { generateThumbnail } from '../utils/generateThumbnail.js';


export const generateThumbnail = async (buffer) => {
  return await sharp(buffer)
    .resize(200, 200) // Adjust size as needed
    .toBuffer();
};



// Define __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


export const ensureDirExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

