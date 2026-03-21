import axiosInstance from "./url.Service"

export const sendOtp = (phoneNumber , phoneSuffix , email)=>{
    try {
        const res =  axiosInstance.post("/auth/sendOtp",{phoneNumber , phoneSuffix , email});
        return res.data;
    } catch (error) {
       console.log('error on send otp',error)
    }

}

export const verifyOtp = (phoneNumber , phoneSuffix ,otp, email)=>{
    try {
        const res =  axiosInstance.post("/auth/verifyOtp",{phoneNumber , phoneSuffix , otp, email});
        return res.data;
    } catch (error) {
        console.log('error on verify otp',error)
    }

}

export const logout = ()=>{
    try {
        const res =  axiosInstance.post("/auth/logout");
        return res.data;
    } catch (error) {
        console.log('error on logout',error)
    }

}

export const UpdatUserProfile = (updatedData)=>{
    try {
        const res =  axiosInstance.put("/auth/updateProfile",updatedData);
        return res.data;
    } catch (error) {
        console.log('error on logout',error)
    }

}

export const checkAuth = ( )=>{
    try {
        const res =  axiosInstance.get("/auth/checkAuth"  );
        if(res.data.status === 'success'){
            return {isAuth:true , user:res?.data?.data}
        }else if(res.data.status === 'error'){
            return {isAuth:false  }
        }
    } catch (error) {
        console.log('error on logout',error)
    }

}

export const getAllUsers = ( )=>{
    try {
        const res =  axiosInstance.get("/auth/users");
        return res.data;
    } catch (error) {
        console.log('error on get all users',error)
    }

}