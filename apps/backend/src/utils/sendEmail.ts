import { Resend } from "resend";
import "Dotenv/config";

const resend = new Resend(process.env.RESEND_API_KEY!); 

export const sendEmail = async(email:string , jwtToken:string) => {
    return await resend.emails.send({
        from:"Login <onboarding@resend.dev>",
        to: [`${email}`],
         subject: "Here's your login link",
          html: `
      <p>Click the link below to sign in:</p>
      <a href="${process.env.API_BASE_URL}/auth/signin/post?token=${jwtToken}">
        Sign In to Exness
      </a>
      <p>If you did not request this, ignore this email.</p>
      <p>Thanks,</p>
      <p>The Exness Team</p>
    `,
    });
};