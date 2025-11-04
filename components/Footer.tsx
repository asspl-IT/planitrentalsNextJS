"use client";

import React, { Fragment } from "react";
import Link from "next/link";
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
} from "react-icons/fa";
import { IoLocationOutline } from "react-icons/io5";
import { TfiHeadphoneAlt } from "react-icons/tfi";
import { FiSend } from "react-icons/fi";
import { AiOutlineFieldTime } from "react-icons/ai";

interface HelpfulLink {
  label: string;
  path: string;
}

interface FooterContent {
  storeAddress: string[];
  helpfulLinks: HelpfulLink[];
}

const Footer: React.FC = () => {
  const footerContent: FooterContent = {
    storeAddress: [
      "896 S Auto Mall Dr",
      "American Fork, UT 84003",
      "801-319-5524",
    ],
    helpfulLinks: [
      { label: "Cancellation Policy", path: "/policies" },
      { label: "Bounce House FAQ", path: "/bouncehouseFaq" },
    ],
  };

  // Format phone number for display
  const formattedPhone = footerContent.storeAddress[2]
    .split("-")
    .map((segment, index, arr) => (
      <Fragment key={index}>
        {index === 0 && "("}
        {segment}
        {index === 0 && ")"}
        {index < arr.length - 1 && (
          <>
            -<wbr />
          </>
        )}
      </Fragment>
    ));

  return (
    <footer className="contact-bg p-7 flex flex-col items-center">
      <div className="w-full flex flex-col md:flex-row md:justify-evenly gap-6">
        {/* Our Store */}
        <div className="text-center md:text-left">
          <h3 className="text-lg font-bold pirBlue--text mb-2">Our Store</h3>
          <p className="pirBlue--text text-sm flex flex-col items-center sm:items-start">
            <span className="font-semibold flex items-center gap-1">
              <IoLocationOutline className="icon" />
              Address:
            </span>
            <span className="break-words max-w-[280px] text-center sm:text-left">
              {footerContent.storeAddress[0]} <br className="sm:hidden" />
              {footerContent.storeAddress[1]}
            </span>
          </p>
          <p className="pirBlue--text text-sm flex items-center justify-center md:justify-start pb-1">
            <span className="font-semibold flex items-center gap-1">
              <TfiHeadphoneAlt className="icon" />
              Call/Text Us:
            </span>
            <span className="ml-1">{formattedPhone}</span>
          </p>
          <p className="pirBlue--text text-sm flex items-center justify-center md:justify-start pb-1">
            <span className="font-semibold flex items-center gap-1">
              <FiSend className="icon" />
              Email:
            </span>
            <span className="ml-1">
              <a
                href="mailto:info@planitrentals.com"
                className="pirGreen--text"
              >
                info@planitrentals.com
              </a>
            </span>
          </p>
        </div>

        {/* Hours Section */}
        <div className="text-center md:text-left">
          <h3 className="text-lg font-bold pirBlue--text mb-2">Hours</h3>
          <p className="pirBlue--text text-sm flex items-center justify-center md:justify-start gap-2 pb-1">
            <AiOutlineFieldTime className="icon" />
            Mon - Fri: 9am - 5pm
          </p>
          <p className="pirBlue--text text-sm flex items-center justify-center md:justify-start gap-2">
            <AiOutlineFieldTime className="icon" />
            Saturday: 8am - Noon
          </p>
          <p className="pirBlue--text text-sm flex items-center justify-center md:justify-start gap-2">
            <AiOutlineFieldTime className="icon" />
            Sunday: Closed
          </p>
        </div>

        {/* Helpful Links */}
        <div className="text-center md:text-left">
          <h3 className="text-lg font-bold pirBlue--text mb-2">
            Helpful Links
          </h3>
          <div>
            {footerContent.helpfulLinks.map((link, index) => (
              <Link
                key={index}
                href={link.path}
                className="pirGreen--text text-sm block py-1 hover:underline"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <p className="pirBlue--text font-semibold mt-2">Follow Us</p>
          <div className="social-icons flex justify-center md:justify-start gap-4 mt-2 text-lg">
            <Link
              href="https://www.facebook.com/planitrentals"
              aria-label="Facebook"
              target="_blank"
            >
              <FaFacebookF />
            </Link>
            <Link
              href="https://x.com/planitrentals"
              aria-label="Twitter"
              target="_blank"
            >
              <FaTwitter />
            </Link>
            <Link
              href="https://www.instagram.com/planitrentals"
              aria-label="Instagram"
              target="_blank"
            >
              <FaInstagram />
            </Link>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="mt-6 text-center">
        <p className="footer-bottom text-sm text-gray-500">
          © Plan-it Rentals - Founded 2013
        </p>
      </div>
    </footer>
  );
};

export default Footer;
