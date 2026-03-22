import { useState } from "react";
import useLoginStore from "../../store/useLoginStore";
import countries from "../../utils/countries.js";
import Spinner from "../../utils/Spinner.jsx";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useNavigate } from "react-router-dom"; // Curly braces add kiye
import { useForm } from "react-hook-form";
import useUserStore from "../../store/useUserStore";
import useThemeStore from "../../store/themeStore";
import { motion } from "framer-motion";
import { FaWhatsapp, FaChevronDown } from "react-icons/fa";
import { UpdatUserProfile, sendOtp, verifyOtp } from "../../services/user.Service.js";
import { toast } from "react-toastify";

//validation schema
const loginValidationSchema = yup
  .object()
  .shape({
    phoneNumber: yup
      .string()
      .nullable()
      .notRequired()
      .matches(/^\d+$/, "Phone number must be 10 digits")
      .transform((value, originalValue) =>
        originalValue.trim() === "" ? null : value,
      ),
    email: yup
      .string()
      .nullable()
      .notRequired()
      .email("Please enter valid email")
      .transform((value, originalValue) =>
        originalValue.trim() === "" ? null : value,
      ),
  })
  .test(
    "at-least-one",
    "Either email or phone number is required",
    function (value) {
      return !!(value.phoneNumber || value.email);
    },
  );

const otpValidationSchema = yup.object().shape({
  otp: yup
    .string()
    .length(6, "OTP must be 6 digits")
    .required("OTP is required"),
});

const profileValidationSchema = yup.object().shape({
  username: yup.string().required("Username is required"),
  agreed: yup
    .boolean()
    .oneOf([true], "You must agree to the terms and conditions"),
});

const avatars = [
  "https://api.dicebear.com/6.x/avataaars/svg?seed=Felix",
  "https://api.dicebear.com/6.x/avataaars/svg?seed=Aneka",
  "https://api.dicebear.com/6.x/avataaars/svg?seed=Mimi",
  "https://api.dicebear.com/6.x/avataaars/svg?seed=Jasper",
  "https://api.dicebear.com/6.x/avataaars/svg?seed=Luna",
  "https://api.dicebear.com/6.x/avataaars/svg?seed=Zoe",
];

function Login() {
  const { step, setStep, userPhoneData, setUserPhoneData, resetLoginState } =
    useLoginStore();
  const [phoneNumber, setPhoneNumber] = useState();
  const [selectedContry, setselectedContry] = useState(countries[0]);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [email, setEmail] = useState("");
  const [profilePic, setProfilePic] = useState(null);
  const [selectedAvatar, setselectedAvtar] = useState(avatars[0]);
  const [profilePicFile, setProfilePicFile] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { setUser } = useUserStore();
  const { theme, setTheme } = useThemeStore();
  const [loading, setLoading] = useState(false);

  // useEffect(() => {
  //  setTheme(!theme);
  // }, []);

  const {
    register: loginRegister,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors },
  } = useForm({
    resolver: yupResolver(loginValidationSchema),
  });

  const {
    handleSubmit: handleOtpSubmit,
    formState: { errors: otpError },
    setValue: setOtpValue,
  } = useForm({
    resolver: yupResolver(otpValidationSchema),
  });

  const {
    register: profileRegister,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileError },
    watch,
  } = useForm({
    resolver: yupResolver(profileValidationSchema),
  });

  const filteredCountries =
    searchTerm.trim() === ""
      ? countries
      : countries.filter(
          (country) =>
            country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            country.dialCode.includes(searchTerm),
        );

  // Api's section for submit
  const onLoginSubmit = async () => {
    try {
      setLoading(true);
      if (email) {
        const response = await sendOtp(null, null, email);
        if (response.status === "success") {
          toast.info("OTP is Send to Your Email");
          setUserPhoneData({ email });
          setStep(2);
        }
      } else {
        const response = await sendOtp(phoneNumber, selectedContry.dialCode);
        if (response.status === "success") {
          toast.info("OTP is Send to Your Phone Number");
          setUserPhoneData({
            phoneNumber,
            phoneSuffix: selectedContry.dialCode,
          });
          setStep(2);
        }
      }
    } catch (error) {
      console.log("error on submitting", error);
      setError(error.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const onOTPSubmit = async () => {
    try {
      setLoading(true);
      if (!userPhoneData) {
        throw new Error("User Phone data not found");
      }
      const otpString = otp.join("");
      let response;
      if (userPhoneData?.email) {
        response = await verifyOtp(null, null, otpString, userPhoneData.email);
      } else {
        response = await verifyOtp(
          userPhoneData?.phoneNumber,
          userPhoneData?.phoneSuffix,
          otpString,
        );
      }

      if (response.status === "success") {
        toast.success("OTP Verified Successfully");
        const user = response.data?.user;
        if (user.username && user?.profilePic) {
          setUser(user);
          toast.success("Welcome to ChatApp");
          navigate("/");
          resetLoginState();
        } else {
          setStep(3);
        }
      }
    } catch (error) {
      console.log("error on submitting", error);
      setError(error.message || "Failed to verify OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e)=>{
    const file = e.target.files[0];
    if(file){
      setProfilePicFile(file)
      setProfilePic(URL.createObjectURL(file))

    }
  }


  // profile submit
  const onProfileSubmit = async (data) => {
    try {
      setLoading(true);
      const fromData = new FormData()
      fromData.append('username',data.username)
      fromData.append('agreed',data.agreed)
      if(profilePicFile){
        fromData.append('media',profilePicFile)
      }else{
        fromData.append('profilePic',selectedAvatar)
      }

      await UpdatUserProfile()
      toast.success("Welcome back to ChatApp")
      navigate('/')
      resetLoginState()

    } catch (error) {
      console.log("error on submitting", error);
      setError(error.message || "Failed to submit profile");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setOtpValue("otp",newOtp.join(""))
    if(value && index<5){
      document.getElementById(`otp-${index + 1}`).focus();

    }
 
  };

  const handleBack = () => {
    setStep(step - 1);
    setUserPhoneData(null)
    setOtp(["", "", "", "", "", ""])
    setError("");
  };

   

  const ProgressBar = () => (
    <div
      className={`w-full ${theme === "dark" ? "bg-gray-800" : "bg-gray-200"} rounded-full h-2.5 mb-4`}
    >
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: step === 1 ? "33%" : step === 2 ? "66%" : "100%" }}
        transition={{ duration: 0.5 }}
        className="bg-green-500 h-2.5 rounded-full"
      />
    </div>
  );

  return (
    <div
      className={`min-h-screen ${theme === "dark" ? "bg-[#0b141a]" : "bg-gray-100"} flex justify-center items-center p-4 overflow-hidden relative`}
    >
      {/* Background Decorative Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-72 h-72 bg-green-500/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-72 h-72 bg-blue-500/10 rounded-full blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className={`${
          theme === "dark"
            ? "bg-[#1f2c33]/90 border-gray-700 text-white"
            : "bg-white/90 border-gray-200 text-black"
        } p-8 md:p-10 rounded-[2.5rem] shadow-2xl w-full max-w-md relative z-10 backdrop-blur-xl border`}
      >
        {/* WhatsApp Icon with Pulse Effect */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            duration: 0.5,
            type: "spring",
            stiffness: 260,
            damping: 20,
          }}
          className="w-20 h-20 bg-linear-to-tr from-green-500 to-emerald-400 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-lg shadow-green-500/20"
        >
          <FaWhatsapp className="text-white text-4xl" />
        </motion.div>

        <h1 className="text-3xl font-black mb-2 text-center tracking-tight">
          ChatApp
        </h1>
        <p
          className={`text-center text-sm font-medium mb-8 ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}
        >
          Modern messaging experience
        </p>

        <ProgressBar />

        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-red-400 text-sm text-center mb-4 bg-red-400/10 py-2 rounded-lg"
          >
            {error}
          </motion.p>
        )}

        {step === 1 && (
          <form className="space-y-6" onSubmit={handleLoginSubmit(onLoginSubmit)}>
            <div className="space-y-4">
              <p
                className={`text-center text-sm font-medium ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}
              >
                Enter details to receive an OTP
              </p>

              {/* Phone Input Group */}
              <div className="relative">
                <div className="flex   group">
                  <div className="relative w-[110px]">
                    <button
                      type="button"
                      className={`h-full w-full flex items-center justify-center gap-2 py-3.5 px-3 text-sm font-bold border-y border-l rounded-s-2xl transition-all
                      ${
                        theme == "dark"
                          ? "bg-gray-800/50 border-gray-600 hover:bg-gray-700 text-white"
                          : "bg-gray-50 border-gray-300 hover:bg-gray-100 text-gray-900"
                      }`}
                      onClick={() => setShowDropdown(!showDropdown)}
                    >
                      <span>
                        {selectedContry.flag} {selectedContry.dialCode}
                      </span>
                      <FaChevronDown
                        className={`text-[10px] transition-transform duration-300 ${showDropdown ? "rotate-180" : ""}`}
                      />
                    </button>

                    {showDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`absolute top-16 left-0 z-50 w-72 rounded-2xl shadow-2xl border overflow-hidden ${
                          theme === "dark"
                            ? "bg-[#2a3942] border-gray-600"
                            : "bg-white border-gray-200"
                        }`}
                      >
                        <div className="p-3 border-b border-gray-600/20">
                          <input
                            type="password"
                            placeholder="Search Country..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={`w-full p-2.5 rounded-xl text-sm outline-none border focus:ring-2 focus:ring-green-500 ${
                              theme === "dark"
                                ? "bg-[#111b21] border-gray-600 text-white"
                                : "bg-gray-50 border-gray-300"
                            }`}
                          />
                        </div>
                        <div className="max-h-60 overflow-y-auto custom-scrollbar">
                          {filteredCountries.map((country, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => {
                                setselectedContry(country);
                                setShowDropdown(false);
                                setSearchTerm("");
                              }}
                              className={`flex items-center w-full px-4 py-3 text-sm hover:bg-green-500 hover:text-white transition-colors ${
                                theme === "dark"
                                  ? "text-gray-300"
                                  : "text-gray-700"
                              }`}
                            >
                              <span className="mr-3 text-lg">
                                {country.flag}
                              </span>
                              <span className="flex-1 truncate font-medium">
                                {country.name}
                              </span>
                              <span className="font-mono opacity-50">
                                {country.dialCode}
                              </span>
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </div>

                  <input
                    type="text"
                    placeholder="Phone Number"
                    {...loginRegister("phoneNumber")}
                    value={phoneNumber || ""}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className={`w-full py-3.5 px-5 border rounded-e-2xl outline-none transition-all font-mono text-lg
                    ${theme === "dark" ? "bg-gray-800/50 border-gray-600 focus:bg-gray-800" : "bg-gray-50 border-gray-300 focus:bg-white"}
                    ${loginErrors.phoneNumber ? "border-red-500" : "focus:border-green-500 focus:ring-1 focus:ring-green-500"}`}
                  />
                </div>
                {loginErrors.phoneNumber && (
                  <p className="text-red-500 text-[11px] mt-1.5 ml-2 font-medium">
                    {loginErrors.phoneNumber.message}
                  </p>
                )}
              </div>

              {/* Divider */}
              <div className="flex items-center py-2">
                <div className="grow h-px bg-linear-to-r from-transparent via-gray-500/30 to-transparent"></div>
                <span className="mx-4 text-gray-500 text-xs font-bold uppercase tracking-widest">
                  or
                </span>
                <div className="grow h-px bg-linear-to-r from-transparent via-gray-500/30 to-transparent"></div>
              </div>

              {/* Email Input */}
              <div className="space-y-1">
                <input
                  type="text"
                  placeholder="Email Address (Optional)"
                  {...loginRegister("email")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full py-3.5 px-5 border rounded-2xl outline-none transition-all
                  ${theme === "dark" ? "bg-gray-800/50 border-gray-600" : "bg-gray-50 border-gray-300"}
                  ${loginErrors.email ? "border-red-500" : "focus:border-green-500 focus:ring-1 focus:ring-green-500"}`}
                />
                {loginErrors.email && (
                  <p className="text-red-500 text-[11px] mt-1 ml-2 font-medium">
                    {loginErrors.email.message}
                  </p>
                )}
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-2xl shadow-xl shadow-green-500/20 active:scale-[0.97] transition-all text-lg mt-4"
            >
              {loading ? <Spinner /> : "Send OTP"}
            </button>
          </form>
        )}

       {step === 2 && ( // dhyan rakna step 2 hona chahiye OTP ke liye
  <motion.form 
    initial={{ x: 20, opacity: 0 }} 
    animate={{ x: 0, opacity: 1 }}
    className="space-y-6" 
    onSubmit={handleOtpSubmit(onOTPSubmit)}
  >
    <div className="space-y-6">
      <div className="text-center">
        <p className={`text-sm font-medium tracking-wide ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
          Verification Code
        </p>
        <p className={`text-xs mt-1 opacity-70 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>
          Enter the 6-digit code sent to your device
        </p>
      </div>

      {/* OTP Input Group */}
      <div className="flex justify-center gap-2 sm:gap-3">
        {otp.map((digit, index) => (
          <input
            key={index}
            id={`otp-${index}`}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={1}
            value={digit || ""} 
            onChange={(e) => {
              const val = e.target.value;
              if (/^\d*$/.test(val)) { // Only numbers allowed
                handleOtpChange(index, val);
                // Auto focus next
                if (val && index < 5) {
                  document.getElementById(`otp-${index + 1}`).focus();
                }
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Backspace" && !digit && index > 0) {
                document.getElementById(`otp-${index - 1}`).focus();
              }
            }}
            className={`w-11 h-14 sm:w-12 sm:h-16 text-center text-2xl font-black border-2 rounded-2xl outline-none transition-all duration-200
            ${theme === "dark" 
              ? "bg-gray-800/40 border-gray-700 text-white focus:bg-gray-800 focus:border-green-500 shadow-inner" 
              : "bg-gray-50 border-gray-200 text-gray-900 focus:bg-white focus:border-green-500 shadow-sm"}
            ${otpError.otp ? "border-red-500 ring-1 ring-red-500" : "focus:ring-2 focus:ring-green-500/20"}`}
          />
        ))}
      </div>

      {otpError.otp && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-500 text-[11px] text-center font-semibold bg-red-500/10 py-1 rounded-md">
          {otpError.otp.message}
        </motion.p>
      )}

      {/* Resend Logic (Uncomment if needed) */}
      <div className="flex flex-col items-center gap-4">
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-green-500/25 active:scale-[0.97] transition-all text-lg flex justify-center items-center"
        >
          {loading ? <Spinner /> : "Verify & Proceed"}
        </button>

        <button 
          type="button"
          onClick={handleBack} 
          className={`text-sm font-bold transition-colors ${theme === "dark" ? "text-gray-500 hover:text-white" : "text-gray-400 hover:text-gray-800"}`}
        >
          Change Phone Number?
        </button>
      </div>
    </div>
  </motion.form>
)}
      </motion.div>
    </div>
  );
}

export default Login;
