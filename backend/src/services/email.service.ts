import nodemailer, { Transporter } from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import logger from '../utils/logger';

let transporter: Transporter | null = null;

// Create transporter lazily (after env vars are loaded)
const getTransporter = (): Transporter => {
  if (!transporter) {
    const options: SMTPTransport.Options = {
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || '465'),
      secure: true, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    };
    transporter = nodemailer.createTransport(options);

    logger.info('Email transporter created', {
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      user: process.env.EMAIL_USER,
    });
  }
  return transporter;
};

export const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    const transport = getTransporter();
    const info = await transport.sendMail({
      from: `"SiviAcademy" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    logger.info('Email sent', { to, subject, messageId: info.messageId });
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    logger.error('Email error', { to, subject, error: error.message });
    return { success: false, error };
  }
};

export const sendOTPEmail = async (to: string, otp: string) => {
  const currentYear = new Date().getFullYear();
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #f4f4f5;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f4f5;">
        <tr>
          <td align="center" style="padding: 40px 20px;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 480px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">

              <!-- Header -->
              <tr>
                <td style="padding: 32px 40px 24px; border-bottom: 1px solid #e5e7eb;">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                    <tr>
                      <td>
                        <span style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 22px; font-weight: 700; color: #111827;">Sivi<span style="color: #0085FF;">Academy</span></span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Content -->
              <tr>
                <td style="padding: 32px 40px;">
                  <p style="margin: 0 0 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 15px; line-height: 24px; color: #374151;">
                    Hi there,
                  </p>
                  <p style="margin: 0 0 24px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 15px; line-height: 24px; color: #374151;">
                    Use the code below to verify your account. This code will expire in 10 minutes.
                  </p>

                  <!-- OTP Box -->
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                    <tr>
                      <td align="center" style="padding: 24px; background-color: #f9fafb; border-radius: 6px; border: 1px solid #e5e7eb;">
                        <span style="font-family: 'SF Mono', 'Consolas', monospace; font-size: 32px; font-weight: 600; letter-spacing: 6px; color: #111827;">${otp}</span>
                      </td>
                    </tr>
                  </table>

                  <p style="margin: 24px 0 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; line-height: 22px; color: #6b7280;">
                    If you didn't request this code, you can safely ignore this email. Someone may have entered your email address by mistake.
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="padding: 24px 40px; background-color: #f9fafb; border-top: 1px solid #e5e7eb; border-radius: 0 0 8px 8px;">
                  <p style="margin: 0 0 8px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13px; color: #6b7280;">
                    SiviAcademy - Rajasthan Govt Exam Preparation
                  </p>
                  <p style="margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 12px; color: #9ca3af;">
                    © ${currentYear} SiviAcademy. All rights reserved.
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
  return sendEmail(to, 'Your verification code - SiviAcademy', html);
};

export const sendWelcomeEmail = async (to: string, name: string) => {
  const currentYear = new Date().getFullYear();
  const firstName = name.split(' ')[0];
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #f4f4f5;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f4f5;">
        <tr>
          <td align="center" style="padding: 40px 20px;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 560px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">

              <!-- Header -->
              <tr>
                <td style="padding: 32px 40px 24px; border-bottom: 1px solid #e5e7eb;">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                    <tr>
                      <td>
                        <span style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 22px; font-weight: 700; color: #111827;">Sivi<span style="color: #0085FF;">Academy</span></span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Content -->
              <tr>
                <td style="padding: 32px 40px;">
                  <h1 style="margin: 0 0 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 24px; font-weight: 600; color: #111827;">
                    Welcome aboard, ${firstName}!
                  </h1>
                  <p style="margin: 0 0 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 15px; line-height: 24px; color: #374151;">
                    Thanks for creating your account. You've taken the first step towards cracking your Rajasthan government exams.
                  </p>
                  <p style="margin: 0 0 24px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 15px; line-height: 24px; color: #374151;">
                    Here's what you can do next:
                  </p>

                  <!-- Features List -->
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom: 24px;">
                    <tr>
                      <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6;">
                        <table role="presentation" cellspacing="0" cellpadding="0">
                          <tr>
                            <td style="width: 32px; vertical-align: top;">
                              <span style="font-size: 16px;">📚</span>
                            </td>
                            <td style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; color: #374151;">
                              <strong style="color: #111827;">Browse Courses</strong> — Structured preparation for RAS, REET, Patwar & more
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6;">
                        <table role="presentation" cellspacing="0" cellpadding="0">
                          <tr>
                            <td style="width: 32px; vertical-align: top;">
                              <span style="font-size: 16px;">📝</span>
                            </td>
                            <td style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; color: #374151;">
                              <strong style="color: #111827;">Practice Tests</strong> — Mock tests based on actual exam patterns
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 12px 0;">
                        <table role="presentation" cellspacing="0" cellpadding="0">
                          <tr>
                            <td style="width: 32px; vertical-align: top;">
                              <span style="font-size: 16px;">📊</span>
                            </td>
                            <td style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; color: #374151;">
                              <strong style="color: #111827;">Track Progress</strong> — Monitor your performance and improve
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>

                  <!-- CTA Button -->
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                    <tr>
                      <td>
                        <a href="https://siviacademy.in/dashboard" style="display: inline-block; padding: 12px 24px; background-color: #0085FF; color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; font-weight: 500; text-decoration: none; border-radius: 6px;">
                          Go to Dashboard
                        </a>
                      </td>
                    </tr>
                  </table>

                  <p style="margin: 24px 0 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; line-height: 22px; color: #6b7280;">
                    Questions? Just reply to this email — we're here to help.
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="padding: 24px 40px; background-color: #f9fafb; border-top: 1px solid #e5e7eb; border-radius: 0 0 8px 8px;">
                  <p style="margin: 0 0 8px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13px; color: #6b7280;">
                    SiviAcademy - Rajasthan Govt Exam Preparation
                  </p>
                  <p style="margin: 0 0 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 12px; color: #9ca3af;">
                    Jaipur, Rajasthan, India
                  </p>
                  <p style="margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 12px; color: #9ca3af;">
                    © ${currentYear} SiviAcademy. All rights reserved.
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
  return sendEmail(to, `Welcome to SiviAcademy, ${firstName}!`, html);
};

export const sendAdminOTPEmail = async (to: string, otp: string, adminName: string) => {
  const currentYear = new Date().getFullYear();
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #111827;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #111827;">
        <tr>
          <td align="center" style="padding: 40px 20px;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 480px; background-color: #1f2937; border-radius: 8px; border: 1px solid #374151;">

              <!-- Header -->
              <tr>
                <td style="padding: 32px 40px 24px; border-bottom: 1px solid #374151;">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                    <tr>
                      <td>
                        <span style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 22px; font-weight: 700; color: #ffffff;">Sivi<span style="color: #0085FF;">Academy</span></span>
                        <span style="display: inline-block; margin-left: 12px; padding: 4px 10px; background-color: #374151; border-radius: 4px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11px; font-weight: 500; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.5px;">Admin</span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Content -->
              <tr>
                <td style="padding: 32px 40px;">
                  <p style="margin: 0 0 8px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 15px; line-height: 24px; color: #9ca3af;">
                    Hi ${adminName},
                  </p>
                  <p style="margin: 0 0 24px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 15px; line-height: 24px; color: #d1d5db;">
                    Someone is attempting to sign in to your admin account. Use this code to complete the authentication:
                  </p>

                  <!-- OTP Box -->
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                    <tr>
                      <td align="center" style="padding: 24px; background-color: #111827; border-radius: 6px; border: 1px solid #374151;">
                        <span style="font-family: 'SF Mono', 'Consolas', monospace; font-size: 32px; font-weight: 600; letter-spacing: 6px; color: #ffffff;">${otp}</span>
                      </td>
                    </tr>
                  </table>

                  <p style="margin: 20px 0 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13px; line-height: 20px; color: #6b7280;">
                    This code expires in 10 minutes. For security, do not share this code with anyone.
                  </p>

                  <!-- Security Warning -->
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top: 24px;">
                    <tr>
                      <td style="padding: 16px; background-color: rgba(239, 68, 68, 0.1); border-radius: 6px; border: 1px solid rgba(239, 68, 68, 0.2);">
                        <p style="margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13px; line-height: 20px; color: #f87171;">
                          If you didn't request this login, please secure your account immediately by changing your password.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="padding: 24px 40px; background-color: #111827; border-top: 1px solid #374151; border-radius: 0 0 8px 8px;">
                  <p style="margin: 0 0 8px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 13px; color: #6b7280;">
                    SiviAcademy Admin Portal
                  </p>
                  <p style="margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 12px; color: #4b5563;">
                    © ${currentYear} SiviAcademy. All rights reserved.
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
  return sendEmail(to, 'Admin login verification - SiviAcademy', html);
};

export const verifyEmailConnection = async () => {
  try {
    const transport = getTransporter();
    await transport.verify();
    logger.info('Email server connection verified');
    return true;
  } catch (error: any) {
    logger.error('Email server connection failed', { error: error.message });
    return false;
  }
};

export default { sendEmail, sendOTPEmail, sendWelcomeEmail, sendAdminOTPEmail, verifyEmailConnection };
