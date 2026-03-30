
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

export const sendReminderEmail = async ({ toEmail, toName, otherName, sessionTime, sessionDate }) => {
  try {
    await transporter.sendMail({
      from: `"SkillSwap" <${process.env.GMAIL_USER}>`,
      to: toEmail,
      subject: `⏰ Session Reminder — Your session starts in 1 hour!`,
      html: `
        <!DOCTYPE html>
        <html>
        <body style="margin:0;padding:0;background:#f4f4f7;font-family:'Helvetica Neue',Arial,sans-serif;">
          <div style="max-width:520px;margin:40px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
            
            <!-- Header -->
            <div style="background:#0a0a0a;padding:32px 40px;text-align:center;">
              <h1 style="color:#ffffff;margin:0;font-size:1.4rem;font-weight:700;letter-spacing:-0.01em;">
                Skill<span style="color:#aaaaaa;font-weight:400;">Swap</span>
              </h1>
            </div>

            <!-- Body -->
            <div style="padding:40px;">
              <p style="color:#888;font-size:0.8rem;letter-spacing:0.12em;text-transform:uppercase;margin:0 0 12px;">Session Reminder</p>
              <h2 style="color:#111;font-size:1.4rem;margin:0 0 20px;font-weight:600;">
                ⏰ Your session starts in 1 hour!
              </h2>
              
              <p style="color:#555;font-size:0.95rem;line-height:1.6;margin:0 0 28px;">
                Hi <strong>${toName}</strong>, just a reminder that your skill swap session with 
                <strong>${otherName}</strong> is coming up soon.
              </p>

              <!-- Session details card -->
              <div style="background:#f8f8f8;border-radius:12px;padding:20px 24px;margin-bottom:28px;">
                <div style="display:flex;justify-content:space-between;margin-bottom:12px;">
                  <span style="color:#888;font-size:0.82rem;">With</span>
                  <span style="color:#111;font-size:0.82rem;font-weight:600;">${otherName}</span>
                </div>
                <div style="display:flex;justify-content:space-between;margin-bottom:12px;">
                  <span style="color:#888;font-size:0.82rem;">Date</span>
                  <span style="color:#111;font-size:0.82rem;font-weight:600;">${sessionDate}</span>
                </div>
                <div style="display:flex;justify-content:space-between;">
                  <span style="color:#888;font-size:0.82rem;">Time</span>
                  <span style="color:#111;font-size:0.82rem;font-weight:600;">${sessionTime}</span>
                </div>
              </div>

              <!-- CTA Button -->
              <a href="https://skill-swap-five-chi.vercel.app/dashboard">
                style="display:block;text-align:center;background:#0a0a0a;color:#ffffff;text-decoration:none;padding:14px 24px;border-radius:10px;font-size:0.88rem;font-weight:600;letter-spacing:0.04em;">
                Open SkillSwap →
              </a>
            </div>

            <!-- Footer -->
            <div style="padding:20px 40px;border-top:1px solid #f0f0f0;text-align:center;">
              <p style="color:#bbb;font-size:0.75rem;margin:0;">
                © 2026 SkillSwap — Learn. Share. Grow.
              </p>
            </div>

          </div>
        </body>
        </html>
      `,
    });
    console.log(`✅ Email sent to ${toEmail}`);
  } catch (err) {
    console.error(`❌ Email failed to ${toEmail}:`, err.message);
  }
};