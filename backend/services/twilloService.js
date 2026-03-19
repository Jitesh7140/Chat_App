const twillo = require("twilio");

// twillo credentionals from env;
const accoundSid = process.env.TWILLO_ACCOUNT_SID;
const authToken = process.env.TWILLO_AUTH_TOKEN;
const serviceSid = process.env.TWILLO_SERVICE_SID;

const client = twillo(accoundSid, authToken);

const sendNumberOTP = async (Phonenumber) => {
  try {
    console.log("otp send successfully");
    if (!Phonenumber) {
      throw new Error("fail to sent OTP");
    }
    const response = await client.verify.v2.services(serviceSid)
      .verifications.create({
        to: Phonenumber, 
        channel: "sms",
      });
    console.log("this is my otp reponse ", response);
    // console.log("OTP sent successfully");
    return response;
  } catch (error) {
    console.error("Error sending OTP:", error);
  }
};

const verifNumberyotp = async (Phonenumber, otp) => {
  try {
    console.log("otp send successfully to phone number:", Phonenumber);
    if (!Phonenumber) {
      throw new Error("fail to sent OTP");
    }
    const response = await client.verify._v2
      .services(serviceSid)
      .verificationChecks.create({
        to: Phonenumber,
        code: otp,
      });
    console.log("this is my otp reponse ", response);
    // console.log("OTP sent successfully");
    return response;
  } catch (error) {
    console.error("Error sending OTP:", error);
  }
};

module.exports = { sendNumberOTP , verifNumberyotp };
