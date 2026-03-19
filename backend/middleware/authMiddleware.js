const jwt = require("jsonwebtoken");
const Response = require("../utils/responseHandller");

const authMiddleware = (req, res, next) => {
    try {
        const token = req.cookies.auth_token;
        if (!token) {
            return Response(res, 401, "Unauthorized");
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        console.error("Error on auth middleware: ", error);
        return Response(res, 401, "Auth token expire or missing");
    }
}

module.exports = authMiddleware;
