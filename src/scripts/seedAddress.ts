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
import { VillageModel, WardModel, ThanaModel } from '../modules/address/address.model.js';
import connectDB from "../db/mongo.js";

const seedAddressData = async () => {
  try {
    await connectDB();
    console.log("Connected to MongoDB for Address Seeding...");

    console.log("Removing old address data (Villages, Wards, Thanas)...");
    await VillageModel.deleteMany({});
    await WardModel.deleteMany({});
    await ThanaModel.deleteMany({});
    
    console.log("Dropping old indexes...");
    await VillageModel.collection.dropIndexes().catch(() => {});
    await WardModel.collection.dropIndexes().catch(() => {});
    await ThanaModel.collection.dropIndexes().catch(() => {});
    
    // Recreate indexes based on current schema
    await VillageModel.syncIndexes();
    await WardModel.syncIndexes();
    await ThanaModel.syncIndexes();
    console.log("Old data and indexes removed.");

    // Helper to read JSON
    const readJson = (filename: string) => {
      const filePath = path.join(__dirname, '..', 'adressjson', 'extracted', filename);
      const rawData = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(rawData);
    };

    const villages = readJson('villages.json');
    const wards = readJson('wards.json');
    const thanas = readJson('police_stations.json');

    console.log(`Loaded ${villages.length} Villages, ${wards.length} Wards, ${thanas.length} Thanas.`);

    const makeBulkOps = (dataArray: any[], idField: string) => {
      return dataArray.map((item: any) => {
        return {
          updateOne: {
            filter: { [idField]: item[idField] },
            update: { $set: item },
            upsert: true
          }
        };
      });
    };

    console.log("Seeding Villages in bulk...");
    if (villages.length) await VillageModel.bulkWrite(makeBulkOps(villages, 'lgd_village_code'));

    console.log("Seeding Wards in bulk...");
    if (wards.length) await WardModel.bulkWrite(makeBulkOps(wards, 'lgd_ward_code'));

    console.log("Seeding Thanas in bulk...");
    if (thanas.length) await ThanaModel.bulkWrite(makeBulkOps(thanas, 'code'));

    console.log("✅ Ward, Village, and Thana Data Bulk Seeding Completed Successfully.");
    process.exit(0);

  } catch (error) {
    console.error("❌ Error seeding address data:", error);
    process.exit(1);
  }
};

seedAddressData();
