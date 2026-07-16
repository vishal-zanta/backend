import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "../db/mongo.js";
import { Role } from "../modules/roles/role.model.js";
import { Service } from "../modules/services/service.model.js";
import { SubService } from "../modules/services/subService.model.js";
import { ComplaintSource } from "../modules/complaintSource/complaintSource.model.js";
import { Demography } from "../modules/demography/demography.model.js";
import { Ulb } from "../modules/demography/ulb.model.js";

const rolesData = [
  { designationEnglish: "L1 Field Officer", designationHindi: "एल-1 फील्ड अधिकारी", level: "L1" },
  { designationEnglish: "L2 Supervisory Officer", designationHindi: "एल-2 पर्यवेक्षी अधिकारी", level: "L2" },
  { designationEnglish: "Zone Administrator", designationHindi: "ज़ोन प्रशासक", level: "Zone" },
  { designationEnglish: "ULB Administrator", designationHindi: "नगर निकाय प्रशासक", level: "ULB" },
  { designationEnglish: "Divisional Administrator", designationHindi: "संभागीय प्रशासक", level: "Division" },
  { designationEnglish: "SUDA Administrator", designationHindi: "सुडा प्रशासक", level: "SUDA" },
  { designationEnglish: "Customer Care Executive", designationHindi: "ग्राहक सेवा कार्यपालक", level: "CCE" },
  { designationEnglish: "Call Centre Supervisor", designationHindi: "कॉल सेंटर पर्यवेक्षक", level: "Supervisor" },
    { designationEnglish: 'Admin', designationHindi: 'Admin', level: 'Admin',"permissions":["ALL"] }

];

const complaintSourcesData = [
  "Website",
  "Mobile App",
  "Phone Call / IVR",
  "Twitter / X",
  "Instagram",
  "WhatsApp",
  "Newspaper",
  "Voice Bot",
  "Chat Bot"
];

const servicesData = [
  {
    title: "Street Lighting",
    titleHindi: "स्ट्रीट लाइटिंग",
    department: "Energy Dept",
    subServices: [
      { title: "Street light not working", titleHindi: "Street light not working", sla: 24, geoTagged: true, fieldVisit: true },
      { title: "Street light pole damaged", titleHindi: "Street light pole damaged", sla: 48, geoTagged: true, fieldVisit: true },
      { title: "Exposed wiring / spark", titleHindi: "Exposed wiring / spark", sla: 6, geoTagged: true, fieldVisit: false }
    ]
  },
  {
    title: "Drainage & Sewerage",
    titleHindi: "नाली एवं सीवरेज",
    department: "Urban Dev Dept",
    subServices: [
      { title: "Drain overflow / waterlogging", titleHindi: "Drain overflow / waterlogging", sla: 12, geoTagged: true, fieldVisit: true },
      { title: "Drain blocked", titleHindi: "Drain blocked", sla: 24, geoTagged: true, fieldVisit: true },
      { title: "Drain cover damaged / missing", titleHindi: "Drain cover damaged / missing", sla: 48, geoTagged: true, fieldVisit: false }
    ]
  },
  {
    title: "Water Supply",
    titleHindi: "जल आपूर्ति",
    department: "PHED",
    subServices: [
      { title: "No water supply", titleHindi: "No water supply", sla: 24, geoTagged: true, fieldVisit: true },
      { title: "Dirty / contaminated water", titleHindi: "Dirty / contaminated water", sla: 12, geoTagged: true, fieldVisit: true },
      { title: "Pipe leakage / burst", titleHindi: "Pipe leakage / burst", sla: 8, geoTagged: true, fieldVisit: true }
    ]
  },
  {
    title: "Road & Infrastructure",
    titleHindi: "सड़क एवं बुनियादी ढांचा",
    department: "RCD",
    subServices: [
      { title: "Potholes / damaged road", titleHindi: "Potholes / damaged road", sla: 72, geoTagged: true, fieldVisit: true },
      { title: "Road blockade", titleHindi: "Road blockade", sla: 4, geoTagged: true, fieldVisit: true },
      { title: "Damaged footpath", titleHindi: "Damaged footpath", sla: 96, geoTagged: false, fieldVisit: false }
    ]
  },
  {
    title: "Sanitation & Waste",
    titleHindi: "सफाई एवं कचरा",
    department: "Urban Dev Dept",
    subServices: [
      { title: "Garbage not collected", titleHindi: "Garbage not collected", sla: 24, geoTagged: true, fieldVisit: false },
      { title: "Illegal garbage dumping", titleHindi: "Illegal garbage dumping", sla: 48, geoTagged: true, fieldVisit: true },
      { title: "Public toilet maintenance", titleHindi: "Public toilet maintenance", sla: 24, geoTagged: false, fieldVisit: false }
    ]
  },
  {
    title: "Animal Rescue",
    titleHindi: "जीव बचाव",
    department: "Forest Dept",
    subServices: [
      { title: "Stray dog menace", titleHindi: "Stray dog menace", sla: 12, geoTagged: true, fieldVisit: true },
      { title: "Snake rescue", titleHindi: "Snake rescue", sla: 2, geoTagged: true, fieldVisit: true },
      { title: "Stray cattle on road", titleHindi: "Stray cattle on road", sla: 6, geoTagged: true, fieldVisit: true }
    ]
  },
  {
    title: "Cross-Departmental",
    titleHindi: "अंतर-विभागीय",
    department: "Multi-Dept",
    subServices: [
      { title: "Fallen street light in drain", titleHindi: "Fallen street light in drain", sla: 8, geoTagged: true, fieldVisit: true },
      { title: "Road cut + water pipe damage", titleHindi: "Road cut + water pipe damage", sla: 12, geoTagged: true, fieldVisit: true }
    ]
  }
];

const demographyData = [
  { name: "Patna", nameHindi: "पटना", division: "Patna", zone: "South Bihar", population: 2442383, urban: true },
  { name: "Gaya", nameHindi: "गया", division: "Magadh", zone: "South Bihar", population: 4758432, urban: true },
  { name: "Bhagalpur", nameHindi: "भागलपुर", division: "Bhagalpur", zone: "North Bihar", population: 3137219, urban: true },
  { name: "Muzaffarpur", nameHindi: "मुजफ्फरपुर", division: "Tirhut", zone: "North Bihar", population: 4363769, urban: true },
  { name: "Darbhanga", nameHindi: "दरभंगा", division: "Darbhanga", zone: "North Bihar", population: 3815342, urban: true },
  { name: "Purnia", nameHindi: "पूर्णिया", division: "Purnia", zone: "North Bihar", population: 2927134, urban: true },
  { name: "Katihar", nameHindi: "कटिहार", division: "Purnia", zone: "North Bihar", population: 2687643, urban: true },
  { name: "Begusarai", nameHindi: "बेगूसराय", division: "Munger", zone: "North Bihar", population: 2394064, urban: true },
  { name: "Chapra (Saran)", nameHindi: "छपरा", division: "Saran", zone: "North Bihar", population: 3451303, urban: true },
  { name: "Motihari (E.Champaran)", nameHindi: "मोतिहारी", division: "Tirhut", zone: "North Bihar", population: 4215172, urban: true },
  { name: "Munger", nameHindi: "मुंगेर", division: "Munger", zone: "South Bihar", population: 1367703, urban: true },
  { name: "Buxar", nameHindi: "बक्सर", division: "Saran", zone: "South Bihar", population: 1398105, urban: false }
];

const ulbData = [
  { name: "Patna Municipal Corporation", nameHindi: "पटना नगर निगम", districtName: "Patna", wards: 75, population: 2065784 },
  { name: "Gaya Municipal Corporation", nameHindi: "गया नगर निगम", districtName: "Gaya", wards: 53, population: 470839 },
  { name: "Bhagalpur Municipal Corporation", nameHindi: "भागलपुर नगर निगम", districtName: "Bhagalpur", wards: 51, population: 413200 },
  { name: "Muzaffarpur Municipal Corporation", nameHindi: "मुजफ्फरपुर नगर निगम", districtName: "Muzaffarpur", wards: 49, population: 354462 },
  { name: "Darbhanga Municipal Corporation", nameHindi: "दरभंगा नगर निगम", districtName: "Darbhanga", wards: 48, population: 306956 },
  { name: "Purnia Municipal Corporation", nameHindi: "पूर्णिया नगर निगम", districtName: "Purnia", wards: 45, population: 280583 }
];

const runSeed = async () => {
  try {
    await connectDB();
    console.log("Connected to DB, starting seed...");

    // 1. Seed Roles
    for (const role of rolesData) {
      await Role.findOneAndUpdate(
        { designationEnglish: role.designationEnglish },
        { $set: role },
        { upsert: true, new: true }
      );
    }
    console.log("Roles seeded.");

    // 2. Seed Complaint Sources
    for (const title of complaintSourcesData) {
      await ComplaintSource.findOneAndUpdate(
        { title },
        { $set: { title, active: true } },
        { upsert: true, new: true }
      );
    }
    console.log("Complaint Sources seeded.");

    // 3. Seed Services & SubServices
    for (const s of servicesData) {
      const service = await Service.findOneAndUpdate(
        { title: s.title },
        { $set: { title: s.title, titleHindi: s.titleHindi, department: s.department } },
        { upsert: true, new: true }
      );

      for (const sub of s.subServices) {
        await SubService.findOneAndUpdate(
          { title: sub.title, service: service._id },
          { $set: { ...sub, service: service._id } },
          { upsert: true, new: true }
        );
      }
    }
    console.log("Services and Sub-services seeded.");

    // 4. Seed Demography
    const districtIdMap: Record<string, mongoose.Types.ObjectId> = {};
    for (const d of demographyData) {
      const demo = await Demography.findOneAndUpdate(
        { name: d.name },
        { $set: d },
        { upsert: true, new: true }
      );
      districtIdMap[d.name] = demo._id as mongoose.Types.ObjectId;
    }
    console.log("Demography seeded.");

    // 5. Seed ULBs
    for (const u of ulbData) {
      const districtId = districtIdMap[u.districtName];
      if (districtId) {
        await Ulb.findOneAndUpdate(
          { name: u.name },
          { $set: { name: u.name, nameHindi: u.nameHindi, wards: u.wards, district: districtId } },
          { upsert: true, new: true }
        );
      } else {
        console.warn(`District ${u.districtName} not found for ULB ${u.name}`);
      }
    }
    console.log("ULBs seeded.");

    console.log("Seeding complete!");
    process.exit(0);
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  }
};

runSeed();
