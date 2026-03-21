import { useState, useEffect } from "react";
import useLoginStore from "../../store/useLoginStore";
import countries from "../../utils/countriles";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useNavigate } from "react-router-dom"; // Curly braces add kiye
import { useForm } from "react-hook-form";
import useUserStore from "../../store/useUserStore";
import useThemeStore from "../../store/themeStore";
import { motion } from "framer-motion";

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
    .array()
    .length(6, "OTP must be 6 digits")
    .required("Otp is required"),
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
  const { step, setStep, setUserPhoneData, resetLoginState } = useLoginStore();
  const [PhoneNumber, setPhoneNumber] = useState(null);
  const [selectedContry, setselectedContry] = useState(countries);
  const [otp, setotp] = useState(["", "", "", "", "", ""]);
  const [email, setEmail] = useState("");
  const [profilePic, setProfilePic] = useState(null);
  const [selectedAvatar, setselectedAvtar] = useState(avatars[0]);
  const [profilePicFile, setProfilePicFile] = useState(null);
  const navigate = useNavigate();
  const { setUser } = useUserStore();
  const { theme, setTheme } = useThemeStore();

  const {
    register: loginRegister,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginError },
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

  return (
    <div
      className={`min-h-screen ${theme === "dark" ? "bg-gray-900" : "bg-gray-100"} flex justify-center item-center p-4 overflow-hidden`}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`${theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-100 text-black"} p-6 md:p-8 rounded-lg shadow-2xl w-full max-w-md  relative z-10`}
      >

        <motion.div
        initial={{ scale:0 }}
        animate={{ scale:1, }}
        transition={{ duration: 0.5 ,type:"spring" , stiffness:260,damping:20 }}
        className="w-24 h-24  bg-green-500 rounded-full mx-auto mb-6 flex items-center justify-center"
        >


          
        </motion.div>
        
      </motion.div>
    </div>
  );
}

export default Login;
