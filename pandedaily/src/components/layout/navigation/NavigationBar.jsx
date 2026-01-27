import { useState } from "react";
import logoImage from "../../../assets/hero-images/middle-logo.png";

const NavigationBar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { id: 1, label: "About", href: "#" },
    { id: 2, label: "FAQ", href: "#" },
    { id: 3, label: "Contact", href: "#" },
  ];

  return (
    <nav className="sticky top-0 z-50" style={{ backgroundColor: "#3F2305" }}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-24">
          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-10">
            {navItems.map((item) => (
              <a
                key={item.id}
                href={item.href}
                className="font-medium transition-colors duration-200 hover:opacity-80 text-sm font-[titleFont]"
                style={{ color: "#F5EFE7" }}
              >
                {item.label}
              </a>
            ))}
          </div>
          {/* Logo */}
          <div className="absolute left-1/2 transform -translate-x-1/2 md:relative md:left-0 md:transform-none">
            <img
              src={logoImage}
              alt="Company Logo"
              className="h-20 md:h-24 w-auto cursor-pointer transition-transform duration-200 hover:scale-105"
            />
          </div>
          {/* Order Now Button */}
          <div className="hidden md:block">
            <button
              className="font-medium py-2 px-7 rounded-full transition-all duration-200 shadow-xl hover:shadow-2xl hover:scale-105 cursor-pointer text-sm font-[titleFont]"
              style={{
                backgroundColor: "#F5EFE7",
                color: "#3F2305",
              }}
            >
              Order Now
            </button>
          </div>
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="focus:outline-none"
              aria-label="Toggle menu"
            >
              <div className="space-y-1">
                <span
                  className={`block h-1 w-8 transition-transform ${
                    isMenuOpen ? "rotate-45 translate-y-2" : ""
                  }`}
                  style={{ backgroundColor: "#F5EFE7" }}
                ></span>
                <span
                  className={`block h-1 w-8 ${isMenuOpen ? "opacity-0" : ""}`}
                  style={{ backgroundColor: "#F5EFE7" }}
                ></span>
                <span
                  className={`block h-1 w-8 transition-transform ${
                    isMenuOpen ? "-rotate-45 -translate-y-2" : ""
                  }`}
                  style={{ backgroundColor: "#F5EFE7" }}
                ></span>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div
            className="md:hidden py-6"
            style={{ backgroundColor: "#3F2305" }}
          >
            <div className="flex flex-col space-y-8 px-6">
              {" "}
              {/* Increased spacing */}
              {navItems.map((item) => (
                <a
                  key={item.id}
                  href={item.href}
                  className="font-medium py-4 text-center hover:opacity-80 text-xl"
                  style={{ color: "#F5EFE7" }}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </a>
              ))}
              <button
                className="font-medium py-4 px-8 rounded-full transition-all duration-200 mt-8 hover:scale-105 text-xl"
                style={{
                  backgroundColor: "#F5EFE7",
                  color: "#3F2305",
                }}
              >
                Order Now
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default NavigationBar;
