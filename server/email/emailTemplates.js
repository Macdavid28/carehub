export const verificationEmailTemplate = (firstName, verificationToken) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333333; background-color: #f4f4f7; margin: 0; padding: 0;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); overflow: hidden;">
      <div style="background-color: #2563eb; padding: 20px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: bold;">CareHub</h1>
      </div>
      <div style="padding: 40px 30px;">
        <h2 style="margin-top: 0; color: #1f2937; font-size: 20px;">Verify your email address</h2>
        <p style="color: #4b5563; font-size: 16px;">Hi ${firstName},</p>
        <p style="color: #4b5563; font-size: 16px;">Thanks for starting your account creation with CareHub. Please use the verification code below to complete your registration:</p>
        
          <span style="font-family: monospace; font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #2563eb;">${verificationToken}</span>
        </div>

        <div style="text-align: center; margin: 30px 0;">
           <a href="${process.env.CLIENT_LINK}/verify-email?token=${verificationToken}" style="background-color: #2563eb; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block;">Verify Email</a>
        </div>
        
        <p style="color: #4b5563; font-size: 14px;">This code will expire in 10 minutes.</p>
        <p style="color: #4b5563; font-size: 14px;">If you didn't ask to verify this address, you can safely ignore this email.</p>
      </div>
      <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
        <p style="margin: 0; color: #9ca3af; font-size: 12px;">&copy; ${new Date().getFullYear()} CareHub. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>
`;

export const resetPasswordTemplate = (resetURL) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333333; background-color: #f4f4f7; margin: 0; padding: 0;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); overflow: hidden;">
      <div style="background-color: #dc2626; padding: 20px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: bold;">CareHub</h1>
      </div>
      <div style="padding: 40px 30px;">
        <h2 style="margin-top: 0; color: #1f2937; font-size: 20px;">Password Reset Request</h2>
        <p style="color: #4b5563; font-size: 16px;">We received a request to reset your password. Click the button below to choose a new one:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetURL}" style="background-color: #dc2626; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block;">Reset Password</a>
        </div>
        
        <p style="color: #4b5563; font-size: 14px;">If the button above doesn't work, copy and paste this link into your browser:</p>
        <p style="color: #2563eb; font-size: 12px; word-break: break-all;">${resetURL}</p>
        <p style="color: #4b5563; font-size: 14px; margin-top: 20px;">If you didn't request a password reset, you can safely ignore this email.</p>
      </div>
      <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
        <p style="margin: 0; color: #9ca3af; font-size: 12px;">&copy; ${new Date().getFullYear()} CareHub. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>
`;

export const resetSuccessTemplate = () => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset Successful</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333333; background-color: #f4f4f7; margin: 0; padding: 0;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); overflow: hidden;">
      <div style="background-color: #059669; padding: 20px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: bold;">CareHub</h1>
      </div>
      <div style="padding: 40px 30px; text-align: center;">
        <div style="background-color: #d1fae5; color: #059669; width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px auto; font-size: 30px;">✓</div>
        <h2 style="margin-top: 0; color: #1f2937; font-size: 20px;">Password Updated</h2>
        <p style="color: #4b5563; font-size: 16px;">Your password has been successfully reset. You can now log in with your new password.</p>
        
        <div style="margin-top: 30px;">
          <a href="#" style="background-color: #059669; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block;">Return to Login</a>
        </div>
      </div>
      <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
        <p style="margin: 0; color: #9ca3af; font-size: 12px;">&copy; ${new Date().getFullYear()} CareHub. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>
`;

export const welcomeEmailTemplate = (firstName) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to CareHub</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333333; background-color: #f4f4f7; margin: 0; padding: 0;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); overflow: hidden;">
      <div style="background-color: #2563eb; padding: 40px 20px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">Welcome to CareHub!</h1>
        <p style="color: #e0e7ff; font-size: 16px; margin-top: 10px;">We're thrilled to have you on board.</p>
      </div>
      <div style="padding: 40px 30px;">
        <p style="color: #4b5563; font-size: 16px;">Hi ${firstName},</p>
        <p style="color: #4b5563; font-size: 16px;">Thank you for joining CareHub. Your account has been successfully created.</p>
        <p style="color: #4b5563; font-size: 16px;">You can now explore our vast collection of tech products, track your orders, and enjoy exclusive member deals.</p>
        
        <p style="color: #4b5563; font-size: 14px;">If you have any questions, feel free to reply to this email. We're here to help!</p>
      </div>
      <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
        <p style="margin: 0; color: #9ca3af; font-size: 12px;">&copy; ${new Date().getFullYear()} CareHub. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>
`;
