import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Adjust path depending on execution directory
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Correctly import models
import { DistrictModel, BlockModel, PanchayatModel, ThanaModel } from '../modules/address/address.model.js';

import connectDB from "../db/mongo.js";

const seedAddressData = async () => {
  try {
    await connectDB();
    console.log("Connected to MongoDB for Address Seeding...");

    // Helper to read JSON
    const readJson = (filename: string) => {
      const filePath = path.join(__dirname, '..', 'adressjson', filename);
      const rawData = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(rawData);
    };

    const districts = readJson('districts.json');
    const blocks = readJson('blocks.json');
    const panchayats = readJson('panchayats.json');
    const thanas = readJson('thanas.json');

    console.log(`Loaded ${districts.length} Districts, ${blocks.length} Blocks, ${panchayats.length} Panchayats, ${thanas.length} Thanas.`);

        const makeBulkOps = (dataArray: any[], idField: string) => {
      return dataArray.map((item: any) => ({
        updateOne: {
          filter: { [idField]: item[idField] },
          update: { $set: item },
          upsert: true
        }
      }));
    };

    // 1. Seed Districts
    console.log("Seeding Districts in bulk...");
    if (districts.length) await DistrictModel.bulkWrite(makeBulkOps(districts, 'district_id'));
    
    // 2. Seed Blocks
    console.log("Seeding Blocks in bulk...");
    if (blocks.length) await BlockModel.bulkWrite(makeBulkOps(blocks, 'block_id'));

    // 3. Seed Panchayats
    console.log("Seeding Panchayats in bulk...");
    if (panchayats.length) await PanchayatModel.bulkWrite(makeBulkOps(panchayats, 'panchayat_id'));

    // 4. Seed Thanas
    console.log("Seeding Thanas in bulk...");
    if (thanas.length) await ThanaModel.bulkWrite(makeBulkOps(thanas, 'thanas_id'));

    console.log("✅ Address Data Bulk Seeding Completed Successfully.");
    process.exit(0);

  } catch (error) {
    console.error("❌ Error seeding address data:", error);
    process.exit(1);
  }
};

seedAddressData();
