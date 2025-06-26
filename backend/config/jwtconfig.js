const dotenv = require("dotenv"); 
dotenv.config();
<<<<<<< HEAD

const jwt = require('jsonwebtoken'); 

const jwtConfig = {
    secret: process.env.JWT_SECRET || 'secret_key',

    // Thời gian token hết hạn: 1 ngày
    expiresIn: '1d',

    // Tạo token JWT từ một payload (thường là thông tin người dùng)
    generateToken(payload) {
        return jwt.sign(payload, this.secret, { expiresIn: this.expiresIn });
    },

    // Xác thực token, nếu hợp lệ sẽ trả về thông tin đã mã hóa (payload), nếu không thì trả về null
    verifyJwt(token) {
        try {
            return jwt.verify(token, this.secret);
        } catch (err) {
            return null;
        }
    },

    // Middleware kiểm tra xem request có token hợp lệ hay không
    requireAuth(req, res, next) {
        const authHeader = req.headers.authorization; // Lấy header Authorization
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'No token provided' }); // Không có token
        }

        const token = authHeader.split(' ')[1]; // Lấy phần token sau "Bearer"
        const decoded = jwtConfig.verifyJwt(token); // Giải mã token

        if (!decoded) {
            return res.status(401).json({ message: 'Invalid token' }); // Token không hợp lệ
        }

        req.user = decoded; // Lưu thông tin người dùng vào req để dùng ở bước sau
        next(); // Cho phép tiếp tục thực hiện các middleware hoặc xử lý chính
    },

    // Middleware kiểm tra quyền admin
    requireAdmin(req, res, next) {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwtConfig.verifyJwt(token);

        // Nếu token không hợp lệ hoặc người dùng không phải admin thì từ chối truy cập
        if (!decoded || decoded.role !== 'admin') {
            return res.status(403).json({ message: 'Forbidden: Admins only' });
        }

        req.user = decoded; // Gán thông tin user vào request
        next(); // Cho phép tiếp tục
=======
const jwt = require("jsonwebtoken");

const jwtConfig = {
  secret: process.env.JWT_SECRET || "secret_key",
  expiresIn: "1d",

  generateToken(payload) {
    return jwt.sign(payload, this.secret, { expiresIn: this.expiresIn });
  },

  verifyJwt(token) {
    try {
      return jwt.verify(token, this.secret);
    } catch (err) {
      return null;
>>>>>>> main
    }
  },

  requireAuth(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwtConfig.verifyJwt(token);

    if (!decoded) {
      return res.status(401).json({ message: "Invalid token" });
    }

    req.user = decoded;
    next();
  },

  requireAdmin(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwtConfig.verifyJwt(token);

    if (!decoded || decoded.role !== "admin") {
      return res.status(403).json({ message: "Forbidden: Admins only" });
    }

    req.user = decoded;
    next();
  },

  requireAdminOrStaff(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }
    const token = authHeader.split(" ")[1];
    const decoded = jwtConfig.verifyJwt(token);
    if (!decoded || (decoded.role !== "staff" && decoded.role !== "admin")) {
      return res
        .status(403)
        .json({ message: "Forbidden: Staff and Admins only" });
    }
    req.user = decoded;
    next();
  },
};

module.exports = jwtConfig; 
