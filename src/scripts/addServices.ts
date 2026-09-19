import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from '../db/mongo.js';
import { Department } from '../modules/departments/department.model.js';
import { Service } from '../modules/services/service.model.js';
/**
 * 
 *  - [6a673d4739d3ba640dabe9ef] "Education Department"
 - [6a673d4839d3ba640dabe9f0] "Public health engineering department(PHED)"
 - [6aa0093530deb4f1342d8420] "Dairy fisheries and animal resources Department"
 - [6aa00dea30deb4f1342d846c] "Social welfare Department"
 - [6aa00ded30deb4f1342d848c] "Planning and development Department"
 - [6aa00dee30deb4f1342d8497] "Urban development & housing Department"
 - [6aa00df130deb4f1342d84b2] "SC-ST welfare Department"
 - [6aa00df330deb4f1342d84cd] "Agriculture Department"
 - [6aa00df530deb4f1342d84e0] "Home Department"
 - [6aad1fd8153f7c5af73a7934] "Energy Department"
 */
interface ServiceItem {
  title: string;
  titleHindi: string;
  fieldVisit?: boolean;
  geoTagged?: boolean;
}

interface ServiceSeedData {
  departmentTitle: string;
  departmentTitleHindi: string;
  services: ServiceItem[];
}

const departmentServicesData: ServiceSeedData[] = [
  {
    departmentTitle: "Energy Department",
    departmentTitleHindi: "ऊर्जा विभाग",
    services: [
      {
        title: "Delay in New Connection or Meter",
        titleHindi: "नए कनेक्शन या मीटर में देरी",
      },
      {
        title: "Disconnection of Supply Despite Payment",
        titleHindi: "बिल का भुगतान करने के बावजूद बिजली आपूर्ति काट देना",
      },
      {
        title: "Billing Dispute",
        titleHindi: "बिजली बिल से संबंधित विवाद",
      },
    ],
  },
  {
    departmentTitle: "Agriculture Department",
    departmentTitleHindi: "कृषि विभाग",
    services: [
      {
        title: "PM Kisan Samman Nidhi Related Queries",
        titleHindi: "प्रधानमंत्री किसान सम्मान निधि से संबंधित समस्याएँ/पूछताछ",
      },
      {
        title: "PM Fasal Bima Yojana Related Issues",
        titleHindi: "प्रधानमंत्री फसल बीमा योजना से संबंधित समस्याएँ/पूछताछ",
      },
    ],
  },
  {
    departmentTitle: "SC-ST welfare Department",
    departmentTitleHindi: "अनुसूचित जाति/जनजाति कल्याण विभाग",
    services: [
      {
        title: "Non-PoA Related Grievance",
        titleHindi: "अत्याचार निवारण अधिनियम (PoA) से संबंधित शिकायत के अलावा अन्य शिकायत",
      },
      {
        title: "Ambedkar Awas Yojana",
        titleHindi: "अंबेडकर आवास योजना से संबंधित समस्या",
      },
      {
        title: "Ration Card Related Issues",
        titleHindi: "राशन कार्ड से संबंधित समस्या",
      },
    ],
  },
  {
    departmentTitle: "Social welfare Department",
    departmentTitleHindi: "समाज कल्याण विभाग",
    services: [
      {
        title: "Problem in Applying for Pension",
        titleHindi: "पेंशन के लिए आवेदन करने में समस्या",
      },
      {
        title: "Delay in Approval of Pension",
        titleHindi: "पेंशन की स्वीकृति में देरी",
      },
      {
        title: "Pension Not Being Received",
        titleHindi: "पेंशन प्राप्त नहीं होना",
      },
      {
        title: "Life Certification (Jeevan Pramaan)",
        titleHindi: "जीवन प्रमाण-पत्र (Jeevan Pramaan) से संबंधित समस्या",
      },
    ],
  },
  {
    departmentTitle: "Urban development & housing Department",
    departmentTitleHindi: "नगर विकास एवं आवास विभाग",
    services: [
      {
        title: "Water Logging",
        titleHindi: "जलजमाव की समस्या",
        fieldVisit: true,
      },
      {
        title: "Garbage Not Collected",
        titleHindi: "कूड़ा/कचरा नहीं उठाया जाना",
        fieldVisit: true,
      },
      {
        title: "Open Dumping",
        titleHindi: "खुले में कचरा फेंकना",
        fieldVisit: true,
      },
      {
        title: "Open Manholes",
        titleHindi: "खुले/बिना ढके मैनहोल की समस्या",
        fieldVisit: true,
      },
    ],
  },
  {
    departmentTitle: "Dairy fisheries and animal resources Department",
    departmentTitleHindi: "डेयरी, पशु एवं मत्स्य संसाधन विभाग",
    services: [
      {
        title: "Teleconsultation",
        titleHindi: "दूरस्थ पशु चिकित्सा परामर्श (Teleconsultation)",
      },
      {
        title: "Castration",
        titleHindi: "नसबंदी/बधियाकरण (Castration)",
      },
      {
        title: "Deworming",
        titleHindi: "पशुओं में कृमिनाशक दवा देना (Deworming)",
      },
      {
        title: "Poultry Treatment / Vaccination",
        titleHindi: "मुर्गी/पोल्ट्री का उपचार एवं टीकाकरण",
      },
    ],
  },
  {
    departmentTitle: "Public health engineering department(PHED)",
    departmentTitleHindi: "लोक स्वास्थ्य अभियंत्रण विभाग (PHED)",
    services: [
      {
        title: "Motor Burnt",
        titleHindi: "पानी के मोटर का जल जाना",
      },
      {
        title: "No Power Supply to Motor",
        titleHindi: "मोटर को बिजली की आपूर्ति नहीं होना",
      },
      {
        title: "Operator Does Not Run the Motor / Operator Absent",
        titleHindi: "ऑपरेटर द्वारा मोटर नहीं चलाना / ऑपरेटर का अनुपस्थित रहना",
      },
      {
        title: "Leakage in Pipe",
        titleHindi: "पाइप में लीकेज/रिसाव",
      },
    ],
  },
  {
    departmentTitle: "Health Department",
    departmentTitleHindi: "स्वास्थ्य विभाग",
    services: [
      {
        title: "Hospital Closed",
        titleHindi: "अस्पताल बंद होना",
      },
      {
        title: "Medicine Not Given",
        titleHindi: "दवा उपलब्ध/प्रदान नहीं की जाना",
      },
      {
        title: "Refusal to Admit Patients in Government Facilities",
        titleHindi: "सरकारी स्वास्थ्य संस्थान में मरीज को भर्ती करने से मना करना",
      },
      {
        title: "Poor Hygiene in Hospital",
        titleHindi: "अस्पताल में साफ-सफाई की खराब व्यवस्था",
      },
      {
        title: "Telemedicine Related Issue",
        titleHindi: "टेलीमेडिसिन से संबंधित समस्या",
      },
      {
        title: "Ayushman Bharat Card Related Issue",
        titleHindi: "आयुष्मान भारत कार्ड से संबंधित समस्या",
      },
      {
        title: "Ayushman Bharat Claim Related Issue",
        titleHindi: "आयुष्मान भारत के क्लेम से संबंधित समस्या",
      },
    ],
  },
];

const addServices = async () => {
  try {
    await connectDB();
    console.log("Connected to MongoDB database.\n");

    // 1. Fetch all existing departments from the database
    const existingDepartments = await Department.find();
    console.log(`Found ${existingDepartments.length} existing departments in DB:`);
    existingDepartments.forEach((d) => console.log(` - [${d._id}] "${d.title}"`));
    console.log("");

    // Map existing departments by exact title as well as case-insensitive title
    const departmentMap = new Map<string, typeof existingDepartments[0]>();
    for (const d of existingDepartments) {
      departmentMap.set(d.title.trim().toLowerCase(), d);
    }

    const SLA_HOURS = 48 * 24; // 1152 hours
    let totalServicesAdded = 0;
    let skippedDepartments = 0;

    // 2. Iterate through services data and match existing departments only
    for (const group of departmentServicesData) {
      const deptKey = group.departmentTitle.trim().toLowerCase();
      const matchedDept = departmentMap.get(deptKey);

      // Do NOT create new department; skip if not found
      if (!matchedDept) {
        console.warn(
          `⚠️ Department "${group.departmentTitle}" does not exist in DB. Skipping ${group.services.length} services (no new department created).`
        );
        skippedDepartments++;
        continue;
      }

      // Update Hindi title on the department if not already present
      if (!matchedDept.titleHindi) {
        matchedDept.titleHindi = group.departmentTitleHindi;
        await matchedDept.save();
      }

      console.log(`\nProcessing services for: "${matchedDept.title}" [ID: ${matchedDept._id}]`);

      // 3. Upsert services under this department
      for (const s of group.services) {
        const isFieldVisit = s.fieldVisit ?? false;
        const isGeoTagged = s.geoTagged ?? false;

        const serviceDoc = await Service.findOneAndUpdate(
          {
            title: s.title.trim(),
            department: matchedDept._id,
          },
          {
            $set: {
              title: s.title.trim(),
              titleHindi: s.titleHindi.trim(),
              department: matchedDept._id,
              sla: SLA_HOURS,
              fieldVisit: isFieldVisit,
              geoTagged: isGeoTagged,
              active: true,
            },
          },
          { upsert: true, new: true }
        );

        console.log(
          `  ✓ Service: "${serviceDoc.title}" | Hindi: "${serviceDoc.titleHindi}" | FieldVisit: ${serviceDoc.fieldVisit} | SLA: ${serviceDoc.sla}h`
        );
        totalServicesAdded++;
      }
    }

    console.log(
      `\n Done! Added/Updated ${totalServicesAdded} services. (Skipped ${skippedDepartments} non-existent departments)`
    );
    process.exit(0);
  } catch (error) {
    console.error("Error adding services:", error);
    process.exit(1);
  }
};

addServices();