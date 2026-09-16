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
import { DistrictModel, BlockModel, PanchayatModel, VillageModel, UrbanLocalBodyModel, WardModel, ThanaModel } from '../modules/address/address.model.js';
import connectDB from "../db/mongo.js";

const seedAddressData = async () => {
  try {
    await connectDB();
    console.log("Connected to MongoDB for Address Seeding...");

    console.log("Removing old address data...");
    await mongoose.connection.collection('divisions').deleteMany({});
    await mongoose.connection.collection('subdivisions').deleteMany({});
    await DistrictModel.deleteMany({});
    await BlockModel.deleteMany({});
    await PanchayatModel.deleteMany({});
    await VillageModel.deleteMany({});
    await UrbanLocalBodyModel.deleteMany({});
    await WardModel.deleteMany({});
    await ThanaModel.deleteMany({});
    
    console.log("Dropping old indexes...");
    await DistrictModel.collection.dropIndexes().catch(() => {});
    await BlockModel.collection.dropIndexes().catch(() => {});
    await PanchayatModel.collection.dropIndexes().catch(() => {});
    await VillageModel.collection.dropIndexes().catch(() => {});
    await UrbanLocalBodyModel.collection.dropIndexes().catch(() => {});
    await WardModel.collection.dropIndexes().catch(() => {});
    await ThanaModel.collection.dropIndexes().catch(() => {});
    
    // Recreate indexes based on current schema
    await DistrictModel.syncIndexes();
    await BlockModel.syncIndexes();
    await PanchayatModel.syncIndexes();
    await VillageModel.syncIndexes();
    await UrbanLocalBodyModel.syncIndexes();
    await WardModel.syncIndexes();
    await ThanaModel.syncIndexes();
    console.log("Old data and indexes removed.");

    // Helper to read JSON
    const readJson = (filename: string) => {
      const filePath = path.join(__dirname, '..', 'adressjson', 'extracted', filename);
      const rawData = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(rawData);
    };

    const districts = readJson('districts.json');
    const blocks = readJson('blocks.json');
    const panchayats = readJson('panchayats.json');
    const villages = readJson('villages.json');
    const ulbs = readJson('urban_local_bodies.json');
    const wards = readJson('wards.json');
    const thanas = readJson('police_stations.json');

    console.log(`Loaded ${districts.length} Districts, ${blocks.length} Blocks, ${panchayats.length} Panchayats, ${villages.length} Villages, ${ulbs.length} ULBs, ${wards.length} Wards, ${thanas.length} Thanas.`);

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

    console.log("Seeding Districts in bulk...");
    if (districts.length) await DistrictModel.bulkWrite(makeBulkOps(districts, 'lgd_district_code'));
    
    console.log("Seeding Blocks in bulk...");
    if (blocks.length) await BlockModel.bulkWrite(makeBulkOps(blocks, 'lgd_block_code'));

    console.log("Seeding Panchayats in bulk...");
    if (panchayats.length) await PanchayatModel.bulkWrite(makeBulkOps(panchayats, 'lgd_gp_code'));

    console.log("Seeding Villages in bulk...");
    if (villages.length) await VillageModel.bulkWrite(makeBulkOps(villages, 'lgd_village_code'));

    console.log("Seeding ULBs in bulk...");
    if (ulbs.length) await UrbanLocalBodyModel.bulkWrite(makeBulkOps(ulbs, 'lgd_ulb_code'));

    console.log("Seeding Wards in bulk...");
    if (wards.length) await WardModel.bulkWrite(makeBulkOps(wards, 'lgd_ward_code'));

    console.log("Seeding Thanas in bulk...");
    if (thanas.length) await ThanaModel.bulkWrite(makeBulkOps(thanas, 'code'));

    console.log("✅ Address Data Bulk Seeding Completed Successfully.");
    process.exit(0);

  } catch (error) {
    console.error("❌ Error seeding address data:", error);
    process.exit(1);
  }
};

seedAddressData();
