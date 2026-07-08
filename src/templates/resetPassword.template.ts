export interface ResetPasswordEmailData {
  name: string;
  resetUrl: string;
}

export const resetPasswordEmailTemplate = (data: ResetPasswordEmailData): string => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
    <h2 style="color: #007bff;">Password Reset Request</h2>
    <p>Hi <strong>${data.name}</strong>,</p>
    <p>We received a request to reset your password for your CRM account.</p>
    <div style="margin: 30px 0;">
      <a href="${data.resetUrl}" style="background-color: #007bff; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Reset Password</a>
    </div>
    <p style="font-size: 0.9em; color: #666; margin-top: 30px; border-top: 1px solid #eee; padding-top: 15px;">
      If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
    </p>
  </div>
`;
