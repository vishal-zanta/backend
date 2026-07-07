import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from '../db/mongo.js';
import { Role } from '../modules/roles/role.model.js';

const roles = [
  { designationEnglish: 'L1 Field Officer', designationHindi: 'एल-1 फील्ड अधिकारी', level: 'L1' },
  { designationEnglish: 'L2 Supervisory Officer', designationHindi: 'एल-2 पर्यवेक्षी अधिकारी', level: 'L2' },
  { designationEnglish: 'Zone Administrator', designationHindi: 'ज़ोन प्रशासक', level: 'Zone' },
  { designationEnglish: 'ULB Administrator', designationHindi: 'नगर निकाय प्रशासक', level: 'ULB' },
  { designationEnglish: 'Divisional Administrator', designationHindi: 'संभागीय प्रशासक', level: 'Division' },
  { designationEnglish: 'SUDA Administrator', designationHindi: 'सुडा प्रशासक', level: 'SUDA' },
  { designationEnglish: 'Customer Care Executive', designationHindi: 'ग्राहक सेवा कार्यपालक', level: 'CCE' },
  { designationEnglish: 'Call Centre Supervisor', designationHindi: 'कॉल सेंटर पर्यवेक्षक', level: 'Supervisor' }
];

const seedRoles = async () => {
  try {
    await connectDB();
    console.log('Connected to DB');

    for (const roleData of roles) {
      const existing = await Role.findOne({ designationEnglish: roleData.designationEnglish });
      if (!existing) {
        await Role.create(roleData);
        console.log(`Created role: ${roleData.designationEnglish}`);
      } else {
        console.log(`Role already exists: ${roleData.designationEnglish}`);
      }
    }

    console.log('Roles seeding completed.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding roles:', error);
    process.exit(1);
  }
};

seedRoles();
