"use client";

import Image from "next/image";
import aboutimg from "@/public/about.webp";

const AboutUs = () => {
  const aboutUsText = [
    "We are a family-run business in American Fork, Utah that has found a new approach to the rental business. Our focus on pricing, product selection, and market research puts us above the rest.",
    "We firmly believe that our new approach to the rental world will change the way you look at planning parties, events, reunions, or trips. With our rock-bottom prices, it just makes sense to rent!",
    "Too often we hear the horror stories of renting equipment. Our extensive product research, inspection, and maintenance will ensure your event is a success. We take all of the hassle out of your event by becoming a one-stop shop for all your needs. Planning a party in Utah? Call us up and see how we can help you out. You can guarantee we have the lowest prices, so you don't have to spend countless hours shopping at multiple places! If you Plan-it, they will come!",
  ];

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Text Section */}
        <div>
          <h1 className="text-[40px] md:text-3xl font-bold text-blue-950 mb-4">
            About Us
          </h1>
          <div className="mx-auto text-justify space-y-4 leading-6">
            {aboutUsText.map((paragraph, index) => (
              <p key={index} className="text-blue-950 text-[15px]">
                {paragraph}
              </p>
            ))}
          </div>
        </div>

        {/* Image Section */}
        <div className="flex justify-center">
          <div className="relative w-full max-w-[450px] h-[450px]">
            <Image
              src={aboutimg}
              alt="Event Rentals"
              fill
              className="rounded-lg shadow-lg object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
