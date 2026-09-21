import fs from 'fs';
import path from 'path';
import { v2 } from '@google-cloud/translate';
import dotenv from 'dotenv';

dotenv.config();

const translateClient = new v2.Translate({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS || path.join(process.cwd(), 'hozo-translation-prod-247bbeac1b85.json')
});

async function translateBatch(texts) {
  try {
    const [translations] = await translateClient.translate(texts, 'hi');
    return Array.isArray(translations) ? translations : [translations];
  } catch (error) {
    console.error('Translation error:', error);
    // Return original texts as fallback
    return texts;
  }
}

async function processFile(filePath) {
  console.log(`Processing ${filePath}...`);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  
  const batchSize = 100;
  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);
    
    // Find items that don't have name_local yet
    const itemsToTranslate = batch.filter(item => !item.name_local && item.name_en);
    if (itemsToTranslate.length === 0) continue;
    
    const textsToTranslate = itemsToTranslate.map(item => item.name_en);
    const translations = await translateBatch(textsToTranslate);
    
    itemsToTranslate.forEach((item, index) => {
      item.name_local = translations[index];
    });
    
    console.log(`Translated ${i + batch.length} / ${data.length} items`);
    
    // Save periodically
    if (i % 1000 === 0) {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    }
  }
  
  // Final save
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log(`Completed ${filePath}`);
}

async function main() {
  const dir = path.join(process.cwd(), 'src', 'adressjson', 'extracted');
  const files = ['wards.json', 'police_stations.json', 'villages.json'];
  
  for (const file of files) {
    await processFile(path.join(dir, file));
  }
}

main().catch(console.error);
