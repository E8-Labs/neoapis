import sharp from 'sharp'; // For image processing

export const generateThumbnail = async (buffer) => {
  return await sharp(buffer)
    .resize(200, 200) // Adjust size as needed
    .toBuffer();
};


