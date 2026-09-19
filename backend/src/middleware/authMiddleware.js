const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {

    try {

        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized. Please login first."
            });
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET_KEY
        );

        req.admin = decoded;

        next();

    } catch (error) {

        console.error("Auth Middleware Error:", error);

        return res.status(401).json({
            success: false,
            message: "Invalid or expired token"
        });
    }
};

module.exports = protect;