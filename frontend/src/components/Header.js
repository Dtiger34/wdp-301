import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { logoutUser } from "../services/api";
import { removeToken, getToken, checkUserAuth } from "../utils/auth";
import { Avatar, Dropdown, Space } from "antd";
import { VscSearchFuzzy } from "react-icons/vsc";
import { FaReact } from "react-icons/fa";
import "../css/Header.css";

const Header = () => {
  const navigate = useNavigate();

  const token = getToken();
  const user = token ? checkUserAuth(token) : null;
  const isAdmin = user?.role === "admin";

  const handleLogout = async () => {
    try {
      await logoutUser();
      removeToken();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const items = [
    {
      label: <Link to="/profile">Quản lý tài khoản</Link>,
      key: "account",
    },
    {
      label: (
        <label style={{ cursor: "pointer" }} onClick={handleLogout}>
          Đăng xuất
        </label>
      ),
      key: "logout",
    },
  ];
  if (isAdmin) {
    items.unshift({
      label: <Link to="/admin-dashboard">Admin Dashboard</Link>,
      key: "admin",
    });
  }

  return (
    <div className="header-wrapper">
      <div className="page-header">
        {/* Logo bên trái */}
        <div className="page-header__left" onClick={() => navigate("/")}>
          <FaReact className="icon-react rotate" />
          <span className="logo-text">Book Realm</span>
        </div>

        {/* Thanh tìm kiếm ở giữa */}
        <div className="page-header__center">
          <VscSearchFuzzy className="icon-search" />
          <input
            type="text"
            className="input-search"
            placeholder="Bạn tìm gì hôm nay"
          />
        </div>
        <div>
          <Dropdown menu={{ items }} trigger={["click"]}>
            <Space>
              <Avatar>{user?.fullName?.charAt(0) || "U"}</Avatar>
              {user?.fullName}
            </Space>
          </Dropdown>
        </div>
      </div>
    </div>
  );
};

export default Header;
