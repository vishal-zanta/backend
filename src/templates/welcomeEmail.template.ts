export interface WelcomeEmailData {
  name: string;
  roleEnglish: string;
  roleHindi: string;
  userCode: string;
  email: string;
  password: string;
}

export const welcomeEmailTemplate = (data: WelcomeEmailData): string => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2>Welcome to the CRM, ${data.name}!</h2>
    <p>Your account has been created successfully with the role: <strong>${data.roleEnglish} (${data.roleHindi})</strong>.</p>
    <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
      <p style="margin-top: 0;"><strong>Here are your login credentials:</strong></p>
      <ul style="list-style-type: none; padding-left: 0;">
        <li style="margin-bottom: 10px;"><strong>User Code:</strong> ${data.userCode}</li>
        <li style="margin-bottom: 10px;"><strong>Email / Login ID:</strong> ${data.email}</li>
        <li style="margin-bottom: 0;"><strong>Password:</strong> ${data.password}</li>
      </ul>
    </div>
    <p style="color: #d9534f; font-size: 0.9em;">Please log in and change your password as soon as possible for security purposes.</p>
  </div>
`;
