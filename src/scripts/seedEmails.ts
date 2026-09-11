import mongoose from "mongoose";
import connectDB from "../db/mongo.js";
import { Email } from "../modules/email/email.model.js";
import { Grievance } from "../modules/grievance/grievance.model.js";
import dotenv from "dotenv";

dotenv.config();

const INITIAL_INMAILS = [
  {
    id: "INM-001",
    from: "Vikramaditya Pandey <v.pandey88@gmail.com>",
    fromName: "Vikramaditya Pandey",
    fromEmail: "v.pandey88@gmail.com",
    to: "grievance-support@bihar.gov.in",
    cc: "dm-patna@bihar.gov.in",
    bcc: "",
    subject: "Contaminated brown tap water supply for past 3 days in Kankarbagh",
    body: `Respected Authorities,\n\nI am writing to urgently report severe water contamination in Sector-3, Kankarbagh, Patna. The municipal tap water flowing into residential tanks is dark brown and has a foul odor since Thursday morning. Several children in our society have fallen ill with gastrointestinal issues.\n\nWe request immediate water pipeline inspection and emergency tanker deployment.\n\nThank you,\nVikramaditya Pandey`,
    receivedAt: "2026-08-31T11:30:00Z",
    status: "PENDING",
    complaintId: null,
    attachments: [
      { name: "water_sample.jpg", size: "2.1 MB" },
      { name: "society_letter.pdf", size: "640 KB" },
    ],
  },
  {
    id: "INM-002",
    from: "Sunita Kumari <sunita.k.gaya@outlook.com>",
    fromName: "Sunita Kumari",
    fromEmail: "sunita.k.gaya@outlook.com",
    to: "grievance-support@bihar.gov.in",
    cc: "energy-dept@bihar.gov.in",
    bcc: "",
    subject: "Fallen 11KV electrical wire sparking near residential lane",
    body: `Urgent attention required!\n\nDue to heavy winds last night, an overhead electrical line broke and is currently dangling just 2 feet above the main passage near Vishnupad temple lane, Gaya. Sparks were seen twice this morning. School children and cattle frequent this lane.\n\nPlease dispatch an emergency repair team immediately.\n\nRegards,\nSunita Kumari`,
    receivedAt: "2026-08-31T10:15:00Z",
    status: "PENDING",
    complaintId: null,
    attachments: [{ name: "broken_wire_site.jpg", size: "3.4 MB" }],
  },
  {
    id: "INM-003",
    from: "Anil Kumar Mishra <anil.mishra.muz@yahoo.com>",
    fromName: "Anil Kumar Mishra",
    fromEmail: "anil.mishra.muz@yahoo.com",
    to: "grievance-support@bihar.gov.in",
    cc: "commissioner-muz@bihar.gov.in",
    bcc: "",
    subject: "Drainage overflow causing knee-deep waterlogging outside Mithanpura market",
    body: `Sir,\n\nThe main storm drain near Mithanpura market, Muzaffarpur has collapsed from the center. Sewage water has flooded the entire road, blocking customer entrance to over 40 shops. Despite informing local sanitation staff twice, no action has been taken.\n\nKindly register this grievance for urgent desludging.\n\nAnil Kumar Mishra`,
    receivedAt: "2026-08-31T08:00:00Z",
    status: "PENDING",
    complaintId: null,
    attachments: [{ name: "drain_blockage.png", size: "1.8 MB" }],
  },
  {
    id: "INM-004",
    from: "Rajeshwar Singh <rsingh.promo@bizdeal.in>",
    fromName: "Rajeshwar Singh",
    fromEmail: "rsingh.promo@bizdeal.in",
    to: "grievance-support@bihar.gov.in",
    cc: "",
    bcc: "",
    subject: "Special commercial promotional offer for office supplies & stationery",
    body: `Dear Officer,\n\nWe are pleased to introduce our comprehensive range of stationery and office furniture at 30% discounted rates for government bodies. Please find the attached brochure for procurement inquiry.\n\nBest,\nBizDeal Enterprises`,
    receivedAt: "2026-08-31T06:45:00Z",
    status: "PENDING",
    rejectionReason: "Commercial spam / promotional offer",
    complaintId: null,
    attachments: [{ name: "catalogue_2026.pdf", size: "4.2 MB" }],
  },
  {
    id: "INM-005",
    from: "Dr. Pratibha Jha <pratibha.jha.doc@gmail.com>",
    fromName: "Dr. Pratibha Jha",
    fromEmail: "pratibha.jha.doc@gmail.com",
    to: "grievance-support@bihar.gov.in",
    cc: "health-secretary@bihar.gov.in",
    bcc: "",
    subject: "Potholes and cave-in on primary ambulance route to Civil Hospital",
    body: `Dear Grievance Cell,\n\nThe 1.5 km stretch from Tower Chowk to Laheriasarai Hospital, Darbhanga has developed severe 2-foot deep craters due to recent rains. Ambulance transfers are severely jolted and critically ill patients are suffering. Urgent road patching required.\n\nDr. Pratibha Jha`,
    receivedAt: "2026-08-30T16:10:00Z",
    status: "PENDING",
    complaintId: null,
    attachments: [
      { name: "pothole_1.jpg", size: "2.8 MB" },
      { name: "pothole_2.jpg", size: "3.1 MB" },
    ],
  },
  {
    id: "INM-006",
    from: "Mohammad Tariq <tariq.purnia@gmail.com>",
    fromName: "Mohammad Tariq",
    fromEmail: "tariq.purnia@gmail.com",
    to: "grievance-support@bihar.gov.in",
    cc: "",
    bcc: "",
    subject: "Stray dog pack menace near primary girls school Line Bazar",
    body: `Respected Sir/Madam,\n\nA pack of 8-10 aggressive stray dogs has made the playground area outside Line Bazar Primary School, Purnia dangerous. Two students were injured last week. We request the municipal dog squad to visit promptly.\n\nThank you,\nMohammad Tariq`,
    receivedAt: "2026-08-30T13:25:00Z",
    status: "PENDING",
    complaintId: null,
    attachments: [],
  },
  {
    id: "INM-007",
    from: "Pooja Verma <pooja.verma91@yahoo.co.in>",
    fromName: "Pooja Verma",
    fromEmail: "pooja.verma91@yahoo.co.in",
    to: "grievance-support@bihar.gov.in",
    cc: "nagarnigam.begusarai@bihar.gov.in",
    bcc: "",
    subject: "Garbage dump not cleared for 5 consecutive days near residential society",
    body: `Hello,\n\nThe garbage vat at Har-Har Mahadev Chowk, Begusarai has completely overflowed onto the road. Stray animals are scattering waste everywhere and the stench has made it impossible to open windows. Please instruct sanitation team to clear it.\n\nPooja Verma`,
    receivedAt: "2026-08-30T10:40:00Z",
    status: "PENDING",
    complaintId: null,
    attachments: [{ name: "garbage_vat.jpg", size: "1.9 MB" }],
  },
  {
    id: "INM-008",
    from: "Sanjay Sahay <ssahay.test@domain.com>",
    fromName: "Sanjay Sahay",
    fromEmail: "ssahay.test@domain.com",
    to: "grievance-support@bihar.gov.in",
    cc: "",
    bcc: "",
    subject: "Information request regarding municipal trade license renewals",
    body: `Respected Sir,\n\nKindly provide details on the online portal link and deadline for commercial trade license renewal for retail establishments in Patna.\n\nRegards,\nSanjay Sahay`,
    receivedAt: "2026-08-29T14:15:00Z",
    status: "PENDING",
    closeReason: "Information / Clarification Provided - Answered directly via phone & email",
    complaintId: null,
    attachments: [],
  },
];

async function seedEmails() {
  try {
    await connectDB();
    console.log("Connected to MongoDB. Seeding emails...");

    for (const mail of INITIAL_INMAILS) {
      let grievanceRef = null;
      if (mail?.complaintId) {
        const g = await Grievance.findOne({ grievanceId: mail?.complaintId ||null });
        if (g) {
          grievanceRef = g._id;
        }
      }

      await Email.findOneAndUpdate(
        { emailId: mail.id },
        {
          emailId: mail.id,
          from: mail.from,
          fromName: mail.fromName,
          fromEmail: mail.fromEmail,
          to: mail.to,
          cc: mail.cc,
          bcc: mail.bcc,
          subject: mail.subject,
          body: mail.body,
          receivedAt: new Date(mail.receivedAt),
          status: mail.status,
          rejectionReason: (mail as any).rejectionReason,
          closeReason: (mail as any).closeReason,
          complaintId: mail.complaintId,
          grievance: grievanceRef,
          attachments: mail.attachments
        },
        { upsert: true, new: true }
      );
    }
    
    console.log("Emails seeded successfully.");
    process.exit(0);
  } catch (err) {
    console.error("Error seeding emails:", err);
    process.exit(1);
  }
}

seedEmails();
