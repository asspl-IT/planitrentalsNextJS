"use client"; // only if you’re using Next.js App Router

import React, { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { FaGreaterThan } from "react-icons/fa6";
import star from "@/public/starr.webp"; 

const BounceHouseFAQ = () => {
  const items = [
    {
      title: "How Long Do I Get My Bounce House?",
      content:
        "Our bounce house rentals are for a full day! Pickups are between 9:30am and noon the day of your rental (by appointment), return is anytime before 9am the next business day (our business days are Monday to Saturday). We have normally have an after-hours drop-off option you may use, and we will explain those details in your reminder email and at pickup. It is your responsibility to pass that information along to anyone who may be dropping off for you. Our after-hours procedure changes based on time of year, volume, and other factors - so do not assume it is the same as when you rented a previous time. You may also drop off during our regular business hours (usually 7-9am the day after your rental), BUT THE BOUNCE HOUSE MUST BE RETURNED BEFORE 9AM THE NEXT BUSINESS DAY! Again, additional details on our after-hours accommodations will be explained at pickup.",
    },
    {
      title: "What Is Included In The Rental?",
      content:
        "The published rate includes the bounce house, blower, stakes, and all the training/instruction you'll need!",
    },
    {
      title: "How Do I Make a Reservation?",
      content:
        "Call or text us for availability. Once you are ready to make a reservation, we require a $25 deposit to hold your reservation. That is not an extra $25, that $25 will get subtracted from the total you owe, and the balance will be due at pickup. We also require you read this page thoroughly and digitally sign your name below; acknowledging you have read, understood, and agreed to our policies.",
    },
    {
      title: "What Age Of Kids & How Many?",
      content:
        "Our bounce houses are generally for kids 10 and under. Older kids usually need much larger, heavier, and more expensive bounce houses to keep them entertained. We believe the bounce house rental industry has overlooked the 10 and younger crowd, and has failed to have bounce houses that accommodate this age group at a reasonable price! Most of our bouncers accommodate 8-10 kids at a time, and 500lbs at a time - so they are perfect for birthday parties, family gatherings, and much more! All of our bounce houses with slides help circulate the kids in and out of the bounce house, so a party can easily have more kids than what the bouncer can hold at once!",
    },
    {
      title: "What Vehicle Will I Need?",
      content:
        "All of our bounce houses come in a large duffle bag, and can be carried by 1 or 2 people (Dolphin Dive and Raging Rainforest require 3-4 people). The recommended vehicle is listed next to each bounce house - but please error on the side of bringing too big of a vehicle! Also keep in mind that if your reservation contains other items (i.e. a cotton candy machine) - you will need to plan for additional space.",
    },
    {
      title: "How Do I Set It Up?",
      content:
        "The setup of the bounce house is VERY simple! You will have it up and running in less than 5 minutes. We have a full instructional video that teaches you how to setup the bounce house, and we ask that you (and any others setting up the bounce house) have watched it before attempting to set it up. Please designate an area on grass or indoors, and you'll want to make sure you are close to power (and water if you reserve a wet bouncer) or rent a generator for an extra $25 per day. We do require a tarp to be underneath each bouncer. You may use your own, or rent ours for $5.",
    },
    {
      title: "How Do I Return It?",
      content:
        "As stated above, the bounce house is generally due before 9am the business day following your reservation (see your reminder email for further details). There are steep fees for not having the bounce house back on time, because it will most likely mean that someone else will be waiting or without their bounce house (because of you) - which does not reflect well on our business. The bounce house must be returned CLEAN AND DRY. It is very easy to dry a bounce house (the instructional video provides instructions and tips), and unless Plan-it Rentals is notified of any circumstances preventing you from drying/cleaning a bounce house, we will enforce fees for not doing so.",
    },
    {
      title: "What Is Your Cancellation Policy?",
      content: `You can view our cancellation policy here:`,
    },
    {
      title: "Do I Need A Generator?",
      content:
        "You do not need a generator to operate our bounce houses. The blower for the bounce house plugs into a standard 110v outlet. You will want to make sure the outlet being used is not powering other devices/appliances - and that it isn't on a circuit that is also supplying power to other things. You will only need a generator if the location you are planning to use does not have power. We rent our generators with our bounce houses for just $40/day.",
    },
    {
      title: "How Does It Work Wet?",
      content:
        "Not all of our bounce houses can be used wet, but they ALL work great dry! If you are using one of our designated wet bouncers with water, the water tubing on the bounce house connects to a standard water hose.",
    },
  ];

  const [activeIndex, setActiveIndex] = useState(null);
  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <>
      <Head>
        <title>Plan-it Rentals | Bounce House FAQ</title>
        <meta
          name="description"
          content="Plan-it Rentals is the top party and event rental company in the United States. With multiple locations, we provide bounce houses, concession machines, and yard games for any party or event."
        />
        <meta name="keywords" content="Party Rentals, Equipment Rentals" />
        <meta
          property="og:title"
          content="Plan-it Rentals | Party & Event Rentals Utah and Texas"
        />
        <meta
          property="og:description"
          content="Plan-it Rentals is the top party and event rental company in the United States. With multiple locations, we provide bounce houses, concession machines, and yard games for any party or event."
        />
        <meta
          property="og:url"
          content="https://www.planitrentals.com/bouncehousefaq"
        />
        <link
          rel="canonical"
          href="https://www.planitrentals.com/bouncehousefaq"
        />
      </Head>

      <div className="page-header md:mt-[100px] breadcrumb-wrap mb-7">
        <div className="flex flex-wrap gap-2 pb-3 text-sm font-semibold pirBlue--text mt-2 md:mt-0">
          <Link href="/" className="pirGreen--text">
            Home
          </Link>
          <FaGreaterThan className="mt-1" />
          <span>Bounce House FAQ</span>
        </div>
      </div>

      <div className="px-4 md:px-8">
        <h1 className="text-2xl md:text-3xl font-bold pirBlue--text text-center mb-4">
          Bounce House FAQ
        </h1>
        <h1 className="text-2xl md:text-3xl font-bold pirBlue--text text-center mb-4">
          A New Approach To The Bounce House Industry!
        </h1>

        <div className="bg-white p-4 md:p-6 rounded-lg shadow-md mb-6 fade-in-out max-w-4xl mx-auto">
          <p className="pirBlue--text text-justify font-semibold text-lg leading-relaxed">
            We believe the bounce house industry is not practical for a kids
            backyard party. Beyond the prices being incredibly expensive, you
            have 2-4 guys coming into your yard to deliver a massively heavy
            unit for just a couple hours of use, and then you have to wait
            around while they deflate and take it away. All of our inflatables
            are custom built for our company. We have unique designs that no
            other company has, and they are built to be incredibly durable and
            lightweight for easy transportation! Come pickup a unit in the
            morning (loaded by our staff) and return the next morning (unloaded
            by our staff). Setup is a breeze, and we include everything you need
            with an instructional video. Come see how we’ve become Utah’s top
            rental company with thousands and thousands of rentals under our
            belt!
          </p>

          <div className="flex flex-col md:flex-row items-center gap-2 mt-4 border-2 border-green-400">
            <ul className="list-disc list-inside p-4 pirBlue--text font-semibold text-md flex-1">
              <li>The Best Prices You'll Find</li>
              <li>Lightweight & Easy To Setup</li>
              <li>All Day Rentals (Saturday renters get Sunday for free!)</li>
              <li>Super Fast Pickup & Dropoff (under 5 mins!)</li>
              <li>Setup on your schedule</li>
              <li>No intrusive setups with strangers in your yard</li>
              <li>Custom & Unique Designs only our company has!</li>
            </ul>

            <Image
              src={star}
              alt="Green Star Highlight"
              className="w-[100px] h-[100px] md:w-[120px] md:h-[120px] object-contain p-2 md:mr-6"
            />
          </div>
        </div>

        {/* Accordion Section */}
        <div className="space-y-4 mb-5 m-10">
          {items.map((item, index) => (
            <div
              key={index}
              className="bg-white border border-green-300 rounded-lg shadow-md"
            >
              <button
                onClick={() => toggleAccordion(index)}
                className="w-full flex justify-between items-center p-4 text-left font-semibold pirBlue--text transition duration-300 ease-in-out hover:bg-gray-100 rounded-lg"
              >
                <span className="text-lg">{item.title}</span>
                <span className="text-lg font-bold">
                  {activeIndex === index ? "−" : "+"}
                </span>
              </button>

              {activeIndex === index && (
                <div className="p-4 bg-gray-50 pirBlue--text text-mb leading-relaxed border-t border-gray-200 rounded-b-lg text-justify">
                  <div dangerouslySetInnerHTML={{ __html: item.content }} />
                  {item.title === "What Is Your Cancellation Policy?" && (
                    <p>
                      <Link
                        href="/policies"
                        className="pirBlue--text font-semibold hover:underline"
                      >
                        Cancellation Policy
                      </Link>
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default BounceHouseFAQ;
