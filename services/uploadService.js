'use strict';

const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const { supabaseAdmin } = require('../config/supabase');

const BUCKET_NAME = 'player-photos';

async function uploadPhotoFromTelegram(bot, fileId) {
  // Step 1: Get the file download URL from Telegram
  const fileInfo = await bot.getFile(fileId);
  const fileUrl = `https://api.telegram.org/file/bot${process.env.BOT_TOKEN}/${fileInfo.file_path}`;

  // Step 2: Download the image as a buffer
  const response = await axios.get(fileUrl, { responseType: 'arraybuffer' });
  const buffer = Buffer.from(response.data);

  // Step 3: Build a unique file name
  const ext = fileInfo.file_path.split('.').pop() || 'jpg';
  const fileName = `${uuidv4()}.${ext}`;

  // Step 4: Upload to Supabase Storage using admin client (bypasses RLS)
  const { data, error } = await supabaseAdmin.storage
    .from(BUCKET_NAME)
    .upload(fileName, buffer, {
      contentType: `image/${ext}`,
      upsert: false,
    });

  if (error) throw new Error(`Supabase upload failed: ${error.message}`);

  // Step 5: Get the public URL
  const { data: urlData } = supabaseAdmin.storage
    .from(BUCKET_NAME)
    .getPublicUrl(fileName);

  if (!urlData || !urlData.publicUrl) {
    throw new Error('Failed to get public URL from Supabase Storage');
  }

  console.log(`✅ Photo uploaded: ${urlData.publicUrl}`);
  return urlData.publicUrl;
}

module.exports = { uploadPhotoFromTelegram };
