import React from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { logoutUser } from "../services/api";
import { removeToken, getToken, checkUserAuth } from "../utils/auth";
import { Avatar, Dropdown, Space } from "antd";
import { VscSearchFuzzy } from "react-icons/vsc";
import { FaReact } from "react-icons/fa";
import "../css/Header.css";
import { useSearch } from "../searchContext";

const Header = () => {
  const navigate = useNavigate();
  const { searchTerm, setSearchTerm } = useSearch();
  const location = useLocation();
  const token = getToken();
  const user = token ? checkUserAuth(token) : null;
  const isAdmin = user?.role === "admin";
  const isStaff = user?.role === "staff";
  const handleLogout = async () => {
    try {
      await logoutUser();
      removeToken();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value); // 👈 cập nhật context
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
  } else if (isStaff) {
    items.unshift({
      label: <Link to="/staff-dashboard">Staff Dashboard</Link>,
      key: "staff",
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
            placeholder="Nhập tên sách"
            value={searchTerm}
            onChange={handleSearchChange} // 👈
          />
        </div>
        <div>
          {user ? (
            <Dropdown menu={{ items }} trigger={["click"]}>
              <Space>
                <Avatar>{user?.fullName?.charAt(0) || "U"}</Avatar>
                {user?.fullName}
              </Space>
            </Dropdown>
          ) : (
            location.pathname !== "/login" && (
              <Link to="/login" className="login-link">
                Đăng nhập
              </Link>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;
