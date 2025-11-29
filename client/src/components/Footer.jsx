import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer
      className="
        py-14 mt-1 max-w-screen-2xl container mx-auto px-14 grid md:grid-cols-3 gap-10
        bg-linear-to-br from-[#6A8EF0] via-[#3F51F4] to-[#2C3ACF]
        text-white
      "
    >

        {/* Branding */}
        <div>
          <h2 className="text-3xl font-extrabold tracking-wide text-[#C3F2EC]">
            ZyCart
          </h2>
          <p className="text-sm mt-3 opacity-80 leading-relaxed">
            Your trusted multi-supplier online marketplace with a modern,
            scalable MERN architecture.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-xl font-semibold mb-4 text-[#C3F2EC]">
            Quick Links
          </h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link
                to="/"
                className="hover:text-[#8FD6F6] transition"
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                to="/profile"
                className="hover:text-[#8FD6F6] transition"
              >
                Profile
              </Link>
            </li>
          </ul>
        </div>

        {/* About */}
        <div>
          <h3 className="text-xl font-semibold mb-4 text-[#C3F2EC]">
            About ZyCart
          </h3>
          <p className="text-sm opacity-80 leading-relaxed">
            Built with a multi-role system for users, suppliers, and admin —
            delivering a rich, seamless e-commerce experience.
          </p>
        </div>

      {/* Bottom Footer */}
      <div className="text-center text-xs opacity-70 mt-12 text-white">
        © {new Date().getFullYear()} ZyCart — All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
