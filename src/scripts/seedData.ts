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
import { Department } from "../modules/departments/department.model.js";
import { User } from "../modules/users/user.model.js";
import { OfficerTagging } from "../modules/officerTagging/officerTagging.model.js";
import { Grievance } from "../modules/grievance/grievance.model.js";
import { FieldVisit } from "../modules/fieldVisit/fieldVisit.model.js";
import { TimelineService } from "../modules/timeline/timeline.service.js";
import { timelineTemplates } from "../modules/timeline/timeline.template.js";

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
    title: "Hand Pump tube well problem",
    titleHindi: "Hand Pump tube well problem",
    department: "PHED",
    subServices: [
      { title: "Repairing of Public hand Pump", titleHindi: "Repairing of Public hand Pump", sla: 24, geoTagged: true, fieldVisit: true },
      { title: "Other", titleHindi: "Other", sla: 24, geoTagged: true, fieldVisit: true }
    ]
  },
  {
    title: "Miscellaneous",
    titleHindi: "Miscellaneous",
    department: "PHED",
    subServices: [
      { title: "Miscellaneous", titleHindi: "Miscellaneous", sla: 24, geoTagged: true, fieldVisit: true }
    ]
  },
  {
    title: "Payment issue related problem",
    titleHindi: "Payment issue related problem",
    department: "PHED",
    subServices: [
      { title: "Electricity bill related", titleHindi: "Electricity bill related", sla: 24, geoTagged: true, fieldVisit: true },
      { title: "Other", titleHindi: "Other", sla: 24, geoTagged: true, fieldVisit: true },
      { title: "Pump operator salary related", titleHindi: "Pump operator salary related", sla: 24, geoTagged: true, fieldVisit: true }
    ]
  },
  {
    title: "Pipe Water Supply related problem",
    titleHindi: "Pipe Water Supply related problem",
    department: "PHED",
    subServices: [
      { title: "Cleaning of water tank five thousand litre", titleHindi: "Cleaning of water tank five thousand litre", sla: 24, geoTagged: true, fieldVisit: true },
      { title: "Cleaning of water tank One lakh litre", titleHindi: "Cleaning of water tank One lakh litre", sla: 24, geoTagged: true, fieldVisit: true },
      { title: "Leakage of water high level", titleHindi: "Leakage of water high level", sla: 24, geoTagged: true, fieldVisit: true },
      { title: "Leakage of water small level", titleHindi: "Leakage of water small level", sla: 24, geoTagged: true, fieldVisit: true },
      { title: "Motor burn", titleHindi: "Motor burn", sla: 24, geoTagged: true, fieldVisit: true },
      { title: "Operator does not run the motor", titleHindi: "Operator does not run the motor", sla: 24, geoTagged: true, fieldVisit: true },
      { title: "Other", titleHindi: "Other", sla: 24, geoTagged: true, fieldVisit: true },
      { title: "Repairing of electricity related", titleHindi: "Repairing of electricity related", sla: 24, geoTagged: true, fieldVisit: true },
      { title: "Repairing of stand post", titleHindi: "Repairing of stand post", sla: 24, geoTagged: true, fieldVisit: true },
      { title: "Repairing of starter or steplizer related", titleHindi: "Repairing of starter or steplizer related", sla: 24, geoTagged: true, fieldVisit: true },
      { title: "Testing of water quality", titleHindi: "Testing of water quality", sla: 24, geoTagged: true, fieldVisit: true },
      { title: "Water Connection not provided as main pipeline exists near to complainant's house", titleHindi: "Water Connection not provided as main pipeline exists near to complainant's house", sla: 24, geoTagged: true, fieldVisit: true },
      { title: "Water connection not provided as no main pipeline near the complainant’s house", titleHindi: "Water connection not provided as no main pipeline near the complainant’s house", sla: 24, geoTagged: true, fieldVisit: true },
      { title: "Water is not coming in good pressure", titleHindi: "Water is not coming in good pressure", sla: 24, geoTagged: true, fieldVisit: true },
      { title: "Water is not coming through stand post", titleHindi: "Water is not coming through stand post", sla: 24, geoTagged: true, fieldVisit: true },
      { title: "Water is not coming timely", titleHindi: "Water is not coming timely", sla: 24, geoTagged: true, fieldVisit: true }
    ]
  },
  {
    title: "Water Quality problem",
    titleHindi: "Water Quality problem",
    department: "PHED",
    subServices: [
      { title: "Dirty Water Supply related", titleHindi: "Dirty Water Supply related", sla: 24, geoTagged: true, fieldVisit: true },
      { title: "High amount of Iron in Water related", titleHindi: "High amount of Iron in Water related", sla: 24, geoTagged: true, fieldVisit: true },
      { title: "Water testing related", titleHindi: "Water testing related", sla: 24, geoTagged: true, fieldVisit: true }
    ]
  },
  {
    title: "School - Basic Infrastructure",
    titleHindi: "School - Basic Infrastructure",
    department: "Education Dept",
    subServices: [
      { title: "Condition of school building/rooms", titleHindi: "Condition of school building/rooms", sla: 24, geoTagged: true, fieldVisit: true },
      { title: "Quality of ongoing construction work", titleHindi: "Quality of ongoing construction work", sla: 24, geoTagged: true, fieldVisit: true },
      { title: "Availability and quality of furniture (bench-desk etc.)", titleHindi: "Availability and quality of furniture (bench-desk etc.)", sla: 24, geoTagged: true, fieldVisit: true },
      { title: "Availability of separate toilets for boys and girls", titleHindi: "Availability of separate toilets for boys and girls", sla: 24, geoTagged: true, fieldVisit: true },
      { title: "Drinking water facility", titleHindi: "Drinking water facility", sla: 24, geoTagged: true, fieldVisit: true },
      { title: "Availability of electricity connection, fans, tube lights and bulbs", titleHindi: "Availability of electricity connection, fans, tube lights and bulbs", sla: 24, geoTagged: true, fieldVisit: true },
      { title: "Availability of boundary wall", titleHindi: "Availability of boundary wall", sla: 24, geoTagged: true, fieldVisit: true }
    ]
  },
  {
    title: "School - School Operations",
    titleHindi: "School - School Operations",
    department: "Education Dept",
    subServices: [
      { title: "School not opening on time", titleHindi: "School not opening on time", sla: 24, geoTagged: true, fieldVisit: true },
      { title: "Availability of timetable and conducting of classes accordingly", titleHindi: "Availability of timetable and conducting of classes accordingly", sla: 24, geoTagged: true, fieldVisit: true },
      { title: "Availability and utilization of ICT Lab/Computer Lab", titleHindi: "Availability and utilization of ICT Lab/Computer Lab", sla: 24, geoTagged: true, fieldVisit: true },
      { title: "Availability and utilization of library", titleHindi: "Availability and utilization of library", sla: 24, geoTagged: true, fieldVisit: true },
      { title: "Availability and utilization of laboratory in secondary/senior secondary schools", titleHindi: "Availability and utilization of laboratory in secondary/senior secondary schools", sla: 24, geoTagged: true, fieldVisit: true },
      { title: "Organization of Parent-Teacher Meeting", titleHindi: "Organization of Parent-Teacher Meeting", sla: 24, geoTagged: true, fieldVisit: true },
      { title: "Availability of sports equipment and its use by children", titleHindi: "Availability of sports equipment and its use by children", sla: 24, geoTagged: true, fieldVisit: true },
      { title: "Affiliation/renewal of private schools", titleHindi: "Affiliation/renewal of private schools", sla: 24, geoTagged: true, fieldVisit: true }
    ]
  },
  {
    title: "School - Teacher Conduct",
    titleHindi: "School - Teacher Conduct",
    department: "Education Dept",
    subServices: [
      { title: "Attendance of headmaster/teacher", titleHindi: "Attendance of headmaster/teacher", sla: 24, geoTagged: true, fieldVisit: true },
      { title: "Not coming to school on time", titleHindi: "Not coming to school on time", sla: 24, geoTagged: true, fieldVisit: true },
      { title: "Not conducting classes as per prescribed routine", titleHindi: "Not conducting classes as per prescribed routine", sla: 24, geoTagged: true, fieldVisit: true },
      { title: "Polluting the educational environment", titleHindi: "Polluting the educational environment", sla: 24, geoTagged: true, fieldVisit: true },
      { title: "Instigating other teachers not to teach", titleHindi: "Instigating other teachers not to teach", sla: 24, geoTagged: true, fieldVisit: true },
      { title: "Inappropriate behavior with female teachers/students", titleHindi: "Inappropriate behavior with female teachers/students", sla: 24, geoTagged: true, fieldVisit: true },
      { title: "Involvement in politics in favor of a particular party/group", titleHindi: "Involvement in politics in favor of a particular party/group", sla: 24, geoTagged: true, fieldVisit: true },
      { title: "Involvement in private tuition/coaching institute", titleHindi: "Involvement in private tuition/coaching institute", sla: 24, geoTagged: true, fieldVisit: true }
    ]
  },
  {
    title: "School - MDM (Mid-Day Meal)",
    titleHindi: "School - MDM (Mid-Day Meal)",
    department: "Education Dept",
    subServices: [
      { title: "Supply and quality of MDM", titleHindi: "Supply and quality of MDM", sla: 24, geoTagged: true, fieldVisit: true },
      { title: "Availability and quality of plates for MDM", titleHindi: "Availability and quality of plates for MDM", sla: 24, geoTagged: true, fieldVisit: true },
      { title: "Availability of kitchen shed, gas stove", titleHindi: "Availability of kitchen shed, gas stove", sla: 24, geoTagged: true, fieldVisit: true },
      { title: "Distribution of eggs/seasonal fruits every Friday", titleHindi: "Distribution of eggs/seasonal fruits every Friday", sla: 24, geoTagged: true, fieldVisit: true },
      { title: "Cleanliness and hygiene of kitchen", titleHindi: "Cleanliness and hygiene of kitchen", sla: 24, geoTagged: true, fieldVisit: true }
    ]
  },
  {
    title: "Teacher - Transfer",
    titleHindi: "Teacher - Transfer",
    department: "Education Dept",
    subServices: [
      { title: "Request/complaint related to transfer", titleHindi: "Request/complaint related to transfer", sla: 24, geoTagged: true, fieldVisit: true }
    ]
  },
  {
    title: "Teacher - Establishment Related Matters",
    titleHindi: "Teacher - Establishment Related Matters",
    department: "Education Dept",
    subServices: [
      { title: "Salary payment/salary increment/payment of arrears", titleHindi: "Salary payment/salary increment/payment of arrears", sla: 24, geoTagged: true, fieldVisit: true },
      { title: "Salary fixation", titleHindi: "Salary fixation", sla: 24, geoTagged: true, fieldVisit: true },
      { title: "Approval of maternity/medical/CL/SL/EL leave", titleHindi: "Approval of maternity/medical/CL/SL/EL leave", sla: 24, geoTagged: true, fieldVisit: true },
      { title: "Payment related to retirement benefits", titleHindi: "Payment related to retirement benefits", sla: 24, geoTagged: true, fieldVisit: true },
      { title: "Reimbursement of medical claim", titleHindi: "Reimbursement of medical claim", sla: 24, geoTagged: true, fieldVisit: true },
      { title: "Updating of service book", titleHindi: "Updating of service book", sla: 24, geoTagged: true, fieldVisit: true },
      { title: "Onboarding related to HRMS/Treasury/Employee ID for new teacher", titleHindi: "Onboarding related to HRMS/Treasury/Employee ID for new teacher", sla: 24, geoTagged: true, fieldVisit: true },
      { title: "Any correction required in teacher-related data", titleHindi: "Any correction required in teacher-related data", sla: 24, geoTagged: true, fieldVisit: true }
    ]
  },
  {
    title: "Students - Scheme Related Complaints",
    titleHindi: "Students - Scheme Related Complaints",
    department: "Education Dept",
    subServices: [
      { title: "Kanya Utthan Yojana (Girl Child Upliftment Scheme)", titleHindi: "Kanya Utthan Yojana (Girl Child Upliftment Scheme)", sla: 24, geoTagged: true, fieldVisit: true },
      { title: "Cycle Scheme", titleHindi: "Cycle Scheme", sla: 24, geoTagged: true, fieldVisit: true },
      { title: "Uniform", titleHindi: "Uniform", sla: 24, geoTagged: true, fieldVisit: true },
      { title: "Scholarship", titleHindi: "Scholarship", sla: 24, geoTagged: true, fieldVisit: true },
      { title: "Textbooks", titleHindi: "Textbooks", sla: 24, geoTagged: true, fieldVisit: true },
      { title: "FLN Kit", titleHindi: "FLN Kit", sla: 24, geoTagged: true, fieldVisit: true }
    ]
  },
  {
    title: "Students - General",
    titleHindi: "Students - General",
    department: "Education Dept",
    subServices: [
      { title: "Transfer certificate", titleHindi: "Transfer certificate", sla: 24, geoTagged: true, fieldVisit: true },
      { title: "Correction in mark sheet/certificate/domicile certificate etc.", titleHindi: "Correction in mark sheet/certificate/domicile certificate etc.", sla: 24, geoTagged: true, fieldVisit: true },
      { title: "Inappropriate behavior with students", titleHindi: "Inappropriate behavior with students", sla: 24, geoTagged: true, fieldVisit: true },
      { title: "Indiscipline", titleHindi: "Indiscipline", sla: 24, geoTagged: true, fieldVisit: true }
    ]
  },
  {
    title: "Vendor/Contractor/Supplier - Tender/Payment",
    titleHindi: "Vendor/Contractor/Supplier - Tender/Payment",
    department: "Education Dept",
    subServices: [
      { title: "Tender", titleHindi: "Tender", sla: 24, geoTagged: true, fieldVisit: true },
      { title: "Payment", titleHindi: "Payment", sla: 24, geoTagged: true, fieldVisit: true },
      { title: "Onboarding", titleHindi: "Onboarding", sla: 24, geoTagged: true, fieldVisit: true }
    ]
  },
  {
    title: "University/College - General",
    titleHindi: "University/College - General",
    department: "Education Dept",
    subServices: [
      { title: "Admission", titleHindi: "Admission", sla: 24, geoTagged: true, fieldVisit: true },
      { title: "Delayed session", titleHindi: "Delayed session", sla: 24, geoTagged: true, fieldVisit: true },
      { title: "Examination", titleHindi: "Examination", sla: 24, geoTagged: true, fieldVisit: true },
      { title: "Fee", titleHindi: "Fee", sla: 24, geoTagged: true, fieldVisit: true },
      { title: "Migration certificate not issued", titleHindi: "Migration certificate not issued", sla: 24, geoTagged: true, fieldVisit: true },
      { title: "Correction in mark sheet/certificate etc.", titleHindi: "Correction in mark sheet/certificate etc.", sla: 24, geoTagged: true, fieldVisit: true },
      { title: "Inappropriate behavior with female faculty/students", titleHindi: "Inappropriate behavior with female faculty/students", sla: 24, geoTagged: true, fieldVisit: true },
      { title: "Affiliation of colleges", titleHindi: "Affiliation of colleges", sla: 24, geoTagged: true, fieldVisit: true }
    ]
  },
  {
    title: "Illegal Collection of Money",
    titleHindi: "Illegal Collection of Money",
    department: "Education Dept",
    subServices: [
      { title: "Information regarding illegal collection of money by Education Department staff from any teacher/student for various works", titleHindi: "Information regarding illegal collection of money by Education Department staff from any teacher/student for various works", sla: 24, geoTagged: true, fieldVisit: true }
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

    // 0. Seed Departments
    const uniqueDepartments = [...new Set(servicesData.map(s => s.department))];
    if (!uniqueDepartments.includes("Education Dept")) uniqueDepartments.push("Education Dept");
    
    const departmentMap: Record<string, mongoose.Types.ObjectId> = {};
    for (const dept of uniqueDepartments) {
      const doc = await Department.findOneAndUpdate(
        { title: dept },
        { $set: { title: dept, titleHindi: dept, active: true } },
        { upsert: true, new: true }
      );
      departmentMap[dept] = doc._id as mongoose.Types.ObjectId;
    }
    console.log("Departments seeded.");

    // 1. Seed Roles
    for (const role of rolesData) {
      const roleDeptId = departmentMap["Education Dept"]; // Assigning base roles to Education Dept
      await Role.findOneAndUpdate(
        { designationEnglish: role.designationEnglish },
        { $set: { ...role, department: roleDeptId } },
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
      const deptId = departmentMap[s.department];
      const service = await Service.findOneAndUpdate(
        { title: s.title },
        { $set: { title: s.title, titleHindi: s.titleHindi, department: deptId } },
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
    const adminRole = await Role.findOne({ level: "Admin" });
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
      if (adminRole) {
        await createOfficer("ADMIN_001", "System Admin", "admin@example.com", "9999999995", adminRole._id as mongoose.Types.ObjectId);
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
              mobile: `830775537${5 + i}`,
              alternateMobile: `830775537${5 + i}`,
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
            escalationLevel: 0,
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

          await TimelineService.logEvent({
            grievanceId: grievance._id as any,
            type: "COMPLAINT_REGISTERED",
            actor: {
              name: "System",
              role: "System",
            },
            metadata: {
              description: timelineTemplates.COMPLAINT_REGISTERED(gId, complaintSource.title)
            }
          });

          await TimelineService.logEvent({
            grievanceId: grievance._id as any,
            type: "ASSIGNED",
            actor: {
              name: "System",
              role: "System",
            },
            metadata: {
              description: timelineTemplates.ASSIGNED(l1Role?.designationEnglish || "Officer", l1UserGrievance.name)
            }
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