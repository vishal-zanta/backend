import nodemailer, { type Transporter } from "nodemailer";

const SMTP_HOST: string = process.env.SMTP_HOST || "";
const SMTP_PORT: number = parseInt(process.env.SMTP_PORT || "0", 10);
const SMTP_USER: string = process.env.SMTP_USER || "";
const SMTP_PASS: string = process.env.SMTP_PASS || "";
const SMTP_SECURE: boolean = process.env.SMTP_SECURE === "true";
const DEFAULT_FROM = process.env.FROM_EMAIL || process.env.SMTP_FROM || "no-reply@portal.com";

interface EmailOptions {
  from?: string;
  to: string;
  subject: string;
  text?: string;
  html?: string;
  cc?: string;
  bcc?: string;
  attachments?: Array<{
    filename: string;
    path?: string;
    content?: Buffer | string;
    contentType?: string;
  }>;
}

class EmailService {
  private static transporter: Transporter | null = null;

  private static getTransporter(): Transporter {
    if (!this.transporter) {
      this.transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: SMTP_PORT,
        secure: SMTP_SECURE,
        auth: {
          user: SMTP_USER,
          pass: SMTP_PASS,
        },
      });
    }
    return this.transporter;
  }

  static async sendEmail(options: EmailOptions): Promise<nodemailer.SentMessageInfo> {
    try {
      const transporter = this.getTransporter();
      
      const mailOptions: nodemailer.SendMailOptions = {
        from: options.from || `"App" <${DEFAULT_FROM}>`,
        to: options.to,
        subject: options.subject,
        ...(options.text && { text: options.text }),
        ...(options.html && { html: options.html }),
        ...(options.cc && { cc: options.cc }),
        ...(options.bcc && { bcc: options.bcc }),
        ...(options.attachments && { attachments: options.attachments })
      };

      const info = await transporter.sendMail(mailOptions);
      console.log("Message sent:", info.messageId);
      return info;
    } catch (error: any) {
      console.error("Error sending email:", error);
      throw new Error(error.message || "Failed to send email");
    }
  }
}

export { EmailService };

