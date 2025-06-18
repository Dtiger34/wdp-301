import { jwtDecode } from 'jwt-decode';

/**
 * Lấy token từ localStorage
 */
export const getToken = () => {
    return localStorage.getItem('jwt');
};

/**
 * Lưu token vào localStorage sau khi đăng nhập
 */
export const saveToken = (token) => {
    localStorage.setItem('jwt', token);
};

/**
 * Xóa token khi người dùng đăng xuất
 */
export const removeToken = () => {
    localStorage.removeItem('jwt');
};

/**
 * Giải mã token và trả về thông tin người dùng
 */
export const decodeToken = (token) => {
    if (!token) return null;
    try {
        const decoded = jwtDecode(token); // ✅ đúng tên hàm
        return decoded;
    } catch (err) {
        return null;
    }
};

/**
 * Kiểm tra token còn hiệu lực dựa trên exp
 */
export const isTokenValid = (token) => {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) return false;

    const now = Date.now() / 1000; // Đơn vị: giây
    return decoded.exp > now;
};

/**
 * Kiểm tra và giải mã token, trả về thông tin người dùng nếu hợp lệ
 */
export const checkUserAuth = (token) => {
    if (token && isTokenValid(token)) {
        return decodeToken(token);
    }
    return null;
};