import "dotenv/config";
import mongoose from "mongoose";
import connectDB from "../db/mongo.js";
import { Role } from "../modules/roles/role.model.js";
import { Service } from "../modules/services/service.model.js";
import { SubService } from "../modules/services/subService.model.js";
import { ComplaintSource } from "../modules/complaintSource/complaintSource.model.js";
import { Demography } from "../modules/demography/demography.model.js";
import { Ulb } from "../modules/demography/ulb.model.js";
import { Option } from "../modules/options/option.model.js";
import { User } from "../modules/users/user.model.js";
import { OfficerTagging } from "../modules/officerTagging/officerTagging.model.js";
import { Grievance } from "../modules/grievance/grievance.model.js";
import { FieldVisit } from "../modules/fieldVisit/fieldVisit.model.js";

const rolesData = [
  { designationEnglish: "L1 Field Officer", designationHindi: "एल-1 फील्ड अधिकारी", level: "L1" },
  { designationEnglish: "L2 Supervisory Officer", designationHindi: "एल-2 पर्यवेक्षी अधिकारी", level: "L2" },
  { designationEnglish: "Zone Administrator", designationHindi: "ज़ोन प्रशासक", level: "Zone" },
  { designationEnglish: "ULB Administrator", designationHindi: "नगर निकाय प्रशासक", level: "ULB" },
  { designationEnglish: "Divisional Administrator", designationHindi: "संभागीय प्रशासक", level: "Division" },
  { designationEnglish: "SUDA Administrator", designationHindi: "सुडा प्रशासक", level: "SUDA" },
  { designationEnglish: "Call Center Executive", designationHindi: "ग्राहक सेवा कार्यपालक", level: "CCE" },
  { designationEnglish: "Call Centre Supervisor", designationHindi: "कॉल सेंटर पर्यवेक्षक", level: "Supervisor" },
    { designationEnglish: 'Admin', designationHindi: 'Admin', level: 'Admin',"permissions":["ALL"] }

];
// Supervisor,CCE,Admin

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

const options=[{
  
  "title": "one-time",
  "type": "Evidence Frequency",
  "value": "one_time",
  "active": true
 
},
{
  
  "title": "recurring",
  "type": "Evidence Frequency",
  "value": "recurring",
  "active": true
 
},
{
 
  "title": "Self",
  "type": "Affected Beneficiaries",
  "value": "self",
  "active": true
 
},
{
  
  "title": "Family",
  "type": "Affected Beneficiaries",
  "value": "family",
  "active": true
  
},
{
  
  "title": "Community",
  "type": "Public Impact",
  "value": "community",
  "active": true
  
},
{
 
  "title": "systemic",
  "type": "Public Impact",
  "value": "systemic",
  "active": true
 
},
{

  "title": "Complaint",
  "type": "Grievance Nature",
  "value": "complaint",
  "active": true
  
},
{

  "title": "Request",
  "type": "Grievance Nature",
  "value": "request",
  "active": true
  
},
{
 
  "title": "Enquiry",
  "type": "Grievance Nature",
  "value": "enquiry",
  "active": true
  
},
{

  "title": "Suggestion",
  "type": "Grievance Nature",
  "value": "suggestion",
  "active": true
 
},
{
  
  "title": "Community",
  "type": "Affected Beneficiaries",
  "value": "community",
  "active": true
 
}]

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

    // 6. Seed Options
    for (const opt of options) {
      await Option.findOneAndUpdate(
        { type: opt.type, value: opt.value },
        { $set: opt },
        { upsert: true, new: true }
      );
    }
    console.log("Options seeded.");

    // 7. Seed Officers and OfficerTagging
    const l1Role = await Role.findOne({ level: "L1" });
    const l2Role = await Role.findOne({ level: "L2" });
    const cceRole = await Role.findOne({ level: "CCE" });
    const supervisorRole = await Role.findOne({ level: "Supervisor" });
    const patnaDistrict = await Demography.findOne({ name: "Patna" });
    const streetLightService = await Service.findOne({ title: "Street Lighting" });
    const subServices = await SubService.find({ service: streetLightService?._id });

    if (l1Role && l2Role && patnaDistrict && streetLightService && subServices.length > 0) {
      const createOfficer = async (userCode: string, name: string, email: string, phone: string, roleId: mongoose.Types.ObjectId) => {
        let user = await User.findOne({ email });
        if (!user) {
          user = new User({
            userCode,
            name,
            email,
            phone,
            password: "1234",
            role: roleId,
            district: patnaDistrict._id,
            status: "ACTIVE"
          });
          await user.save();
        } else {
          user.password = "1234";
          user.role = roleId as any;
          await user.save();
        }
        return user;
      };

      const l1User = await createOfficer("L1_001", "L1 Officer Patna", "l1@example.com", "9999999991", l1Role._id as mongoose.Types.ObjectId);
      const l2User = await createOfficer("L2_001", "L2 Officer Patna", "l2@example.com", "9999999992", l2Role._id as mongoose.Types.ObjectId);
      
      if (cceRole) {
        await createOfficer("CCE_001", "CCE Patna", "cce@example.com", "9999999993", cceRole._id as mongoose.Types.ObjectId);
      }
      if (supervisorRole) {
        await createOfficer("SUP_001", "Supervisor Patna", "supervisor@example.com", "9999999994", supervisorRole._id as mongoose.Types.ObjectId);
      }

      const tagOfficer = async (officerId: mongoose.Types.ObjectId) => {
        await OfficerTagging.findOneAndUpdate(
          { officer: officerId },
          {
            $set: {
              officer: officerId,
              service: [streetLightService._id],
              services: subServices.map(s => s._id),
              district: patnaDistrict._id,
              active: true
            }
          },
          { upsert: true, new: true }
        );
      };

      await tagOfficer(l1User._id as mongoose.Types.ObjectId);
      await tagOfficer(l2User._id as mongoose.Types.ObjectId);

      console.log("Officers and Tagging seeded.");
    }

    // 8. Seed Grievances & FieldVisits
    const getOptionId = async (type: string, value: string) => {
      const opt = await Option.findOne({ type, value });
      return opt?._id;
    };
    
    const natureId = await getOptionId("Grievance Nature", "complaint");
    const frequencyId = await getOptionId("Evidence Frequency", "one_time");
    const beneficiaryId = await getOptionId("Affected Beneficiaries", "self");
    const complaintSource = await ComplaintSource.findOne({ title: "Website" });
    const allSubServices = await SubService.find().limit(5);
    const l1UserGrievance = await User.findOne({ email: "l1@example.com" });
    const l2UserGrievance = await User.findOne({ email: "l2@example.com" });
    const districtPatna = await Demography.findOne({ name: "Patna" });

    if (natureId && frequencyId && beneficiaryId && complaintSource && l1UserGrievance && l2UserGrievance && districtPatna && allSubServices.length > 0) {
      for (let i = 0; i < 5; i++) {
        const subSvc = allSubServices[i % allSubServices.length];
        const gId = `BR-2026-00002${3 + i}`;
        
        let grievance = await Grievance.findOne({ grievanceId: gId });
        if (!grievance) {
          grievance = await Grievance.create({
            citizenInfo: {
              fullName: `Tarun Kumar ${i}`,
              mobile: `083077537${5 + i}`,
              alternateMobile: `083077537${5 + i}`,
              email: `tkb8059${i}@gmail.com`,
              preferredLanguage: "English"
            },
            classification: {
              subService: subSvc._id,
              nature: natureId,
              subject: `Grievance about ${subSvc.title}`
            },
            evidence: {
              occurrenceDate: new Date(),
              frequency: frequencyId,
              attachments: []
            },
            impact: {
              affectedBeneficiary: beneficiaryId
            },
            communication: {
              satisfactionSurveyConsent: true
            },
            grievanceId: gId,
            channel: complaintSource._id,
            assignedPriority: "PENDING",
            status: "OPEN",
            address: {
              state: "Bihar",
              district: districtPatna._id,
              subdivision: "Munger Sadar",
              pinCode: "800001"
            },
            escalationLevel: 1,
            createdBy: l2UserGrievance._id,
            assignedOfficer: l1UserGrievance._id,
            geotaggedImages: []
          });
          
          await FieldVisit.create({
            visitId: `FV-${gId}`,
            grievance: grievance._id,
            status: "SCHEDULED",
            schedule: new Date(Date.now() + 86400000), // Next day
            remark: "Initial visit scheduled",
            logs: [{
              action: "CREATED",
              newValue: "SCHEDULED",
              changedAt: new Date()
            }]
          });
        }
      }
      console.log("5 Grievances and Field Visits seeded.");
    }

    console.log("Seeding complete!");
    process.exit(0);
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  }
};

runSeed();

    // npx tsx src/scripts/seedData.ts