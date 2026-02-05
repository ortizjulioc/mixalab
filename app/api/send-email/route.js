import { sendMail } from "@/app/services/sendMail.service";

export const POST = async () => {
  try {
    const response = await sendMail();
    return Response.json({ response });
  } catch (error) {
    return Response.json({ error });
  }
};
