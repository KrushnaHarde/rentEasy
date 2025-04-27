import React from "react";
import { Facebook, Twitter, Instagram, Linkedin, MapPin, Phone, Mail } from "lucide-react";
// Footer Component
const Footer = () => {
    return (
      <footer className="bg-gray-900 text-white pt-16 pb-8">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Column 1: Logo and About */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">
                Rent<span style={{ color: '#1399c6' }}>Easy</span>
              </h2>
              <p className="text-gray-400">
                Simplifying rentals with technology and trust. Your one-stop platform for all rental needs.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="hover:text-rent-light-blue transition-colors duration-200">
                  <Facebook size={20} />
                </a>
                <a href="#" className="hover:text-rent-light-blue transition-colors duration-200">
                  <Twitter size={20} />
                </a>
                <a href="#" className="hover:text-rent-light-blue transition-colors duration-200">
                  <Instagram size={20} />
                </a>
                <a href="#" className="hover:text-rent-light-blue transition-colors duration-200">
                  <Linkedin size={20} />
                </a>
              </div>
            </div>
            
            {/* Column 2: Quick Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-400 hover:text-rent-light-blue transition-colors duration-200">
                    Home
                  </a>
                </li>
                <li>
                  <a href="#about" className="text-gray-400 hover:text-rent-light-blue transition-colors duration-200">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#categories" className="text-gray-400 hover:text-rent-light-blue transition-colors duration-200">
                    Categories
                  </a>
                </li>
                <li>
                  <a href="#testimonials" className="text-gray-400 hover:text-rent-light-blue transition-colors duration-200">
                    Testimonials
                  </a>
                </li>
              </ul>
            </div>
            
            {/* Column 3: Legal */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <a href="/legal#terms" className="text-gray-400 hover:text-rent-light-blue transition-colors duration-200">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="/legal#privacy" className="text-gray-400 hover:text-rent-light-blue transition-colors duration-200">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="/legal#cookie" className="text-gray-400 hover:text-rent-light-blue transition-colors duration-200">
                    Cookie Policy
                  </a>
                </li>
                <li>
                  <a href="/legal#rental" className="text-gray-400 hover:text-rent-light-blue transition-colors duration-200">
                    Rental Agreement
                  </a>
                </li>
              </ul>
            </div>
            
            {/* Column 4: Contact */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <MapPin size={20} className="text-rent-light-blue shrink-0 mr-3 mt-1" />
                  <span className="text-gray-400">
                    123 Rental Street, Suite 456<br />
                    Anytown, ST 12345
                  </span>
                </li>
                <li className="flex items-center">
                  <Phone size={20} className="text-rent-light-blue shrink-0 mr-3" />
                  <span className="text-gray-400">+1 (555) 123-4567</span>
                </li>
                <li className="flex items-center">
                  <Mail size={20} className="text-rent-light-blue shrink-0 mr-3" />
                  <span className="text-gray-400">support@renteasy.com</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8">
            <p className="text-gray-500 text-center text-sm">
              © {new Date().getFullYear()} RentEasy. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
  
    );
  };



  export default Footer;


