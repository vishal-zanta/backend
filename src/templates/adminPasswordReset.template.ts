export interface AdminPasswordResetData {
  name: string;
  userCode: string;
  email: string;
  password: string;
}

export const adminPasswordResetTemplate = (data: AdminPasswordResetData): string => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2>Hello, ${data.name}!</h2>
    <p>An administrator has reset the password for your account.</p>
    <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
      <p style="margin-top: 0;"><strong>Here are your new login credentials:</strong></p>
      <ul style="list-style-type: none; padding-left: 0;">
        <li style="margin-bottom: 10px;"><strong>User Code:</strong> ${data.userCode}</li>
        <li style="margin-bottom: 10px;"><strong>Email / Login ID:</strong> ${data.email}</li>
        <li style="margin-bottom: 0;"><strong>New Password:</strong> ${data.password}</li>
      </ul>
    </div>
    <p style="color: #d9534f; font-size: 0.9em;">For security reasons, you will be required to change this password immediately upon your next login.</p>
    <p>If you did not request this change and believe it was made in error, please contact your administrator.</p>
  </div>
`;
