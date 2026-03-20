const response = require("../utils/responseHandller");
const { uploadfiletocloudinary } = require("../config/imageCloud");
const Status = require("../models/status");
const Message = require("../models/message");
const Conversation = require("../models/conversation");

exports.createStatus = async (req, res, next) => {
  try {
    const { content, contentType } = req.body;
    const userID = req.user.userID;
    const file = req.file;

    let mediaURL = null;
    let finalContentType = contentType || "text";

    //handle file
    if (file) {
      const uploadfile = await uploadfiletocloudinary(file);
      if (!uploadfile?.secure_url) {
        return res.status(400).json({ message: "file upload failed" });
      }
      mediaURL = uploadfile.secure_url;

      if (file.mimetype.startsWith("image")) {
        finalContentType = "image";
      } else if (file.mimetype.startsWith("video")) {
        finalContentType = "video";
      } else {
        return response(res, 400, "invalid file type");
      }

      const expires = new Date();
      expires.setHours(expires.getHours() + 24);

      const status = new Status({
        user: userID,
        content: mediaURL || content,
        contentType: finalContentType,
        imageOrVideoUrl,
        messageStatus,
      });

      await status.save();

      const populateStatus = await Message.findById(status._id)
        .populate("user", "username profilePic")
        .populate("viewers", "username profilePic");

      return response(res, 201, "status created successfully", status);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};


// Get Status
exports.getStatus = async (req, res, next) => {
  try {
    const userID = req.user.userID;

    const status = await Status.find({ expiresAt: { $gt: new Date() } })
      .populate("user", "username profilePic")
      .populate("viewers", "username profilePic").sort({createdAt:-1});

    return response(res, 200, "status fetched successfully", status);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// View Status
exports.viewStatus = async(req,res,next)=>{
    const {statusId} = req.params;
    const userId = req.user.userID;
    try{
        const status = await Status.findById(statusId);
        if(!status){
            return response(res,404,"status not found");
        }
        if(!status.viewers.includes(userId)){ 
            status.viewers.push(userId);
            await status.save();

            const updatedStatus = await Status.findById(statusId)
            .populate("user", "username profilePic")
            .populate("viewers", "username profilePic");

             
        }else{
            console.log("status already viewed");
        } 

        return response(res,200,"status already viewed",status);
    }catch(error){
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }

}


// delete status
exports.deleteStatus = async(req,res,next)=>{
    const {statusId} = req.params;
    const userId = req.user.userID;
    try{
        const status = await Status.findById(statusId);
        if(!status){
            return response(res,404,"status not found");
        }
        if(status.user.toString() != userId){
            return response(res,403,"you are not authorized to delete this status");
        }
        
        await status.deleteOne();
        return response(res,200,"status deleted successfully");
    }catch(error){
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
}