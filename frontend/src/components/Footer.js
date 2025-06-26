import React from "react";
import { FaFacebook, FaGithub, FaEnvelope } from "react-icons/fa";
import "../css/Footer.css";

const Footer = () => {
  return (
    <footer className="custom-footer">
      <div className="footer-content">
        <div className="footer-section">
          <h4>📚 Book Realm</h4>
          <p>Hệ thống quản lý & tìm kiếm sách thân thiện, dễ dùng.</p>
        </div>

        <div className="footer-section">
          <h4>Liên kết</h4>
          <ul>
            <li>
              <a href="/home">Trang chủ</a>
            </li>
            <li>
              <a href="/profile">Tài khoản</a>
            </li>
            <li>
              <a href="/staff/view-books">Quản lý sách</a>
            </li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Liên hệ</h4>
          <p>
            <FaEnvelope /> bookrealm@example.com
          </p>
          <div className="social-icons">
            <a href="#">
              <FaFacebook />
            </a>
            <a href="#">
              <FaGithub />
            </a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        © 2025 Book Realm. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
