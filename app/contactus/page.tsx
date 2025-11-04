"use client"; // Only needed if you're in the app/ directory

import ContactUs from "../../components/ContactUs";
import { FaGreaterThan } from "react-icons/fa6";
import Head from "next/head";
import Link from "next/link";

const ContactUsPage = () => {
  return (
    <>
      <Head>
        <title>Contact | Planitrentals</title>
        <meta
          name="description"
          content="Contact us for any questions you have about our company or our products! We have agents standing by and ready to assist you!"
        />
        <meta name="keywords" content="Party Rentals, Equipment Rentals" />
        <meta property="og:title" content="Contact | Planitrentals" />
        <meta
          property="og:description"
          content="Contact us for any questions you have about our company or our products! We have agents standing by and ready to assist you!"
        />
        <meta
          property="og:url"
          content="https://www.planitrentals.com/contactus"
        />
        <link
          rel="canonical"
          href="https://www.planitrentals.com/contactus"
        />
      </Head>

      {/* Breadcrumb Header */}
      <div className="page-header md:mt-[100px] breadcrumb-wrap mb-7">
        <div className="flex flex-wrap gap-2 text-sm font-semibold pirBlue--text mt-2 md:mt-0">
          <Link href="/" className="pirGreen--text">
            Home
          </Link>
          <FaGreaterThan className="mt-1" />
          <h1>Contact Us</h1>
        </div>
      </div>

      {/* Contact Form Section */}
      <div>
        <ContactUs />
      </div>
    </>
  );
};

export default ContactUsPage;
