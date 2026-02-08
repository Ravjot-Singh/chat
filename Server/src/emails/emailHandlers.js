import { resendClient, sender } from "../lib/resend.js"
import { createWelcomeEmailTemplate } from "./emailTemplates.js"

export const sendWelcomeEmail = async(email , name , clientURL)=>{



    const fromValue = sender.name ? `${sender.name} <${sender.email}>` : sender.email;
    console.log("Sending welcome email from:", fromValue, "to:", email);

    try {
        const { data } = await resendClient.emails.send({
            from: fromValue,
            to: email,
            subject: "Welcome to ChatApp!",
            html: createWelcomeEmailTemplate(name , clientURL)
        });

        console.log("Welcome email sent successfully! --------- data : ", data);
    } catch (err) {
        console.error("Error while sending welcome email : ", err);
        throw new Error("Failed to send welcome email!");
    }

}