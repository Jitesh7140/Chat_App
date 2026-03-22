import axiosInstance from "./url.Service.js"

export const sendOtp = async (phoneNumber , phoneSuffix , email)=>{
    try {
        const res = await axiosInstance.post("/auth/sendOtp",{phoneNumber , phoneSuffix , email});
        return res.data;
    } catch (error) {
       console.log('error on send otp',error)
    }

}

export const verifyOtp = async  (phoneNumber , phoneSuffix ,otp, email)=>{
    try {
        const res = await axiosInstance.post("/auth/verifyOtp",{phoneNumber , phoneSuffix , otp, email});
        return res.data;
    } catch (error) {
        console.log('error on verify otp',error)
    }

}

export const logout = async ()=>{
    try {
        const res = await axiosInstance.post("/auth/logout");
        return res.data;
    } catch (error) {
        console.log('error on logout',error)
    }

}

export const UpdatUserProfile = async (updatedData)=>{
    try {
        const res = await axiosInstance.put("/auth/updateProfile",updatedData);
        return res.data;
    } catch (error) {
        console.log('error on logout',error)
    }

}

export const checkAuth = async  ( )=>{
    try {
        const res = await axiosInstance.get("/auth/checkAuth"  );
        if(res.data.status === 'success'){
            return {isAuth:true , user:res?.data?.data}
        }else if(res.data.status === 'error'){
            return {isAuth:false  }
        }
    } catch (error) {
        console.log('error on logout',error)
    }

}

export const getAllUsers = async ( )=>{
    try {
        const res = await axiosInstance.get("/auth/users");
        return res.data;
    } catch (error) {
        console.log('error on get all users',error)
    }

}