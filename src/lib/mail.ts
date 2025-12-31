import nodemailer from "nodemailer";

// Configuration du transporteur SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

const FROM = process.env.EMAIL_FROM || "Calendrier Couple <noreply@example.com>";
const BASE_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

async function sendEmail({ to, subject, html, text }: EmailOptions) {
  try {
    await transporter.sendMail({
      from: FROM,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ""),
    });
    return { success: true };
  } catch (error) {
    console.error("Erreur envoi email:", error);
    return { success: false, error };
  }
}

// Email de vérification d'email
export async function sendVerificationEmail(email: string, token: string) {
  const verifyUrl = `${BASE_URL}/verify-email?token=${token}`;

  return sendEmail({
    to: email,
    subject: "Vérifiez votre email - Calendrier Couple",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 20px; background-color: #f4f4f5;">
          <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #18181b; margin: 0; font-size: 24px;">Calendrier Couple</h1>
            </div>

            <h2 style="color: #18181b; font-size: 20px; margin-bottom: 16px;">Vérifiez votre adresse email</h2>

            <p style="color: #52525b; line-height: 1.6; margin-bottom: 24px;">
              Bienvenue ! Cliquez sur le bouton ci-dessous pour vérifier votre adresse email et activer votre compte.
            </p>

            <div style="text-align: center; margin: 32px 0;">
              <a href="${verifyUrl}" style="display: inline-block; background-color: #18181b; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 500;">
                Vérifier mon email
              </a>
            </div>

            <p style="color: #71717a; font-size: 14px; margin-top: 32px;">
              Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :<br>
              <a href="${verifyUrl}" style="color: #3b82f6; word-break: break-all;">${verifyUrl}</a>
            </p>

            <p style="color: #a1a1aa; font-size: 12px; margin-top: 32px; padding-top: 16px; border-top: 1px solid #e4e4e7;">
              Ce lien expire dans 24 heures. Si vous n'avez pas créé de compte, ignorez cet email.
            </p>
          </div>
        </body>
      </html>
    `,
  });
}

// Email de réinitialisation de mot de passe
export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${BASE_URL}/reset-password?token=${token}`;

  return sendEmail({
    to: email,
    subject: "Réinitialisation de mot de passe - Calendrier Couple",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 20px; background-color: #f4f4f5;">
          <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #18181b; margin: 0; font-size: 24px;">Calendrier Couple</h1>
            </div>

            <h2 style="color: #18181b; font-size: 20px; margin-bottom: 16px;">Réinitialisation de mot de passe</h2>

            <p style="color: #52525b; line-height: 1.6; margin-bottom: 24px;">
              Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le bouton ci-dessous pour en créer un nouveau.
            </p>

            <div style="text-align: center; margin: 32px 0;">
              <a href="${resetUrl}" style="display: inline-block; background-color: #18181b; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 500;">
                Réinitialiser mon mot de passe
              </a>
            </div>

            <p style="color: #71717a; font-size: 14px; margin-top: 32px;">
              Si le bouton ne fonctionne pas, copiez ce lien :<br>
              <a href="${resetUrl}" style="color: #3b82f6; word-break: break-all;">${resetUrl}</a>
            </p>

            <p style="color: #a1a1aa; font-size: 12px; margin-top: 32px; padding-top: 16px; border-top: 1px solid #e4e4e7;">
              Ce lien expire dans 1 heure. Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.
            </p>
          </div>
        </body>
      </html>
    `,
  });
}

// Email de magic link
export async function sendMagicLinkEmail(email: string, token: string) {
  const magicUrl = `${BASE_URL}/api/auth/magic-link?token=${token}`;

  return sendEmail({
    to: email,
    subject: "Votre lien de connexion - Calendrier Couple",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 20px; background-color: #f4f4f5;">
          <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #18181b; margin: 0; font-size: 24px;">Calendrier Couple</h1>
            </div>

            <h2 style="color: #18181b; font-size: 20px; margin-bottom: 16px;">Connexion sans mot de passe</h2>

            <p style="color: #52525b; line-height: 1.6; margin-bottom: 24px;">
              Cliquez sur le bouton ci-dessous pour vous connecter instantanément à votre compte.
            </p>

            <div style="text-align: center; margin: 32px 0;">
              <a href="${magicUrl}" style="display: inline-block; background-color: #18181b; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 500;">
                Se connecter
              </a>
            </div>

            <p style="color: #71717a; font-size: 14px; margin-top: 32px;">
              Si le bouton ne fonctionne pas, copiez ce lien :<br>
              <a href="${magicUrl}" style="color: #3b82f6; word-break: break-all;">${magicUrl}</a>
            </p>

            <p style="color: #a1a1aa; font-size: 12px; margin-top: 32px; padding-top: 16px; border-top: 1px solid #e4e4e7;">
              Ce lien expire dans 15 minutes et ne peut être utilisé qu'une seule fois.
            </p>
          </div>
        </body>
      </html>
    `,
  });
}

// Email d'invitation partenaire
export async function sendPartnerInvitationEmail(
  email: string,
  senderName: string,
  token: string,
  message?: string
) {
  const inviteUrl = `${BASE_URL}/partner/invite/${token}`;

  return sendEmail({
    to: email,
    subject: `${senderName} vous invite à partager un calendrier`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 20px; background-color: #f4f4f5;">
          <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #18181b; margin: 0; font-size: 24px;">Calendrier Couple</h1>
            </div>

            <h2 style="color: #18181b; font-size: 20px; margin-bottom: 16px;">
              ${senderName} vous invite !
            </h2>

            <p style="color: #52525b; line-height: 1.6; margin-bottom: 24px;">
              ${senderName} souhaite partager un calendrier avec vous. Ensemble, vous pourrez gérer vos événements, tâches et planning.
            </p>

            ${message ? `
              <div style="background-color: #f4f4f5; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
                <p style="color: #52525b; margin: 0; font-style: italic;">"${message}"</p>
              </div>
            ` : ""}

            <div style="text-align: center; margin: 32px 0;">
              <a href="${inviteUrl}" style="display: inline-block; background-color: #ec4899; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 500;">
                Accepter l'invitation
              </a>
            </div>

            <p style="color: #71717a; font-size: 14px; margin-top: 32px;">
              Si le bouton ne fonctionne pas, copiez ce lien :<br>
              <a href="${inviteUrl}" style="color: #3b82f6; word-break: break-all;">${inviteUrl}</a>
            </p>

            <p style="color: #a1a1aa; font-size: 12px; margin-top: 32px; padding-top: 16px; border-top: 1px solid #e4e4e7;">
              Cette invitation expire dans 7 jours.
            </p>
          </div>
        </body>
      </html>
    `,
  });
}

export default transporter;
