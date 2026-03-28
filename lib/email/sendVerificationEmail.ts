import nodemailer from "nodemailer";

function createTransporter() {
  return nodemailer.createTransport({
    host:   process.env.SMTP_HOST ?? "smtp.gmail.com",
    port:   Number(process.env.SMTP_PORT ?? 587),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

export async function sendVerificationEmail(
  to: string,
  name: string,
  token: string
) {
  const base = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const verifyUrl = `${base}/verify-email?token=${token}`;

  const transporter = createTransporter();

  await transporter.sendMail({
    from: `"VegaDrive" <${process.env.SMTP_USER}>`,
    to,
    subject: "Verify your VegaDrive account",
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Verify your email</title>
</head>
<body style="margin:0;padding:0;background:#0f0f0f;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f0f0f;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#1a1a1a;border:1px solid #2a2a2a;border-radius:16px;overflow:hidden;">

          <!-- Header -->
          <tr>
            <td style="padding:32px 40px 24px;border-bottom:1px solid #2a2a2a;">
              <p style="margin:0;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">
                ⚡ VegaDrive
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px 40px;">
              <p style="margin:0 0 8px;font-size:20px;font-weight:600;color:#ffffff;">
                Hi ${name}, verify your email
              </p>
              <p style="margin:0 0 28px;font-size:14px;color:#888;line-height:1.6;">
                Thanks for signing up! Click the button below to confirm your email address and activate your account.
                This link expires in <strong style="color:#aaa;">24 hours</strong>.
              </p>

              <!-- CTA button -->
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="border-radius:10px;background:#7c3aed;">
                    <a href="${verifyUrl}"
                       style="display:inline-block;padding:13px 32px;font-size:14px;font-weight:600;
                              color:#ffffff;text-decoration:none;border-radius:10px;">
                      Verify email address
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:28px 0 0;font-size:12px;color:#555;line-height:1.6;">
                Or copy this link into your browser:<br/>
                <a href="${verifyUrl}" style="color:#7c3aed;word-break:break-all;">${verifyUrl}</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px;border-top:1px solid #2a2a2a;">
              <p style="margin:0;font-size:12px;color:#555;">
                If you didn't create a VegaDrive account, you can safely ignore this email.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim(),
  });
}
