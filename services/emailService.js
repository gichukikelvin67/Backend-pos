const {Resend} =require("resend");

const resend=new Resend(process.env.RESEND_API_KEY);

const sendVerificationEmail=async (email,name,token)=>{
    const verificationUrl=`${process.env.FRONTEND_URL}/verify-email?token=${token}&email=${encodeURIComponent(email)}`;


    await resend.emails.send({
        from:process.env.EMAIL_FROM,
        to:email,
        subject:"Verify your M-Pesa account",
        html:`
        <div style="font-family:Arial,sans derif; max-width:600px; margin:auto;">
       <h2>Welcome to M-Pesa POS, ${name}!</h2>

        <p>
          Thanks for creating your account.
          Please verify your email address to continue.
        </p>

        <a
          href="${verificationUrl}"
          style="
            display:inline-block;
            padding:12px 20px;
            background:#111827;
            color:white;
            text-decoration:none;
            border-radius:6px;
          "
        >
          Verify Email
        </a>

        <p style="margin-top:20px;">
          This verification link expires in 24 hours.
        </p>

        <p>
          If you did not create this account, you can safely ignore this email.
        </p>
      </div> 
      `,
    })
}
module.exports={
    sendVerificationEmail
};