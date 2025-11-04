"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

const Banner = () => {
  const [banners, setBanners] = useState<any[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    axios
      .get(`${process.env.NEXT_PUBLIC_AWS_BLOG}banners`)
      .then((res) => {
        const filtered = res.data.filter(
          (b: any) => b.location === "American Fork, UT"
        );
        setBanners(filtered);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!isPaused && banners.length > 0) {
      const interval = setInterval(
        () => setActiveIndex((prev) => (prev + 1) % banners.length),
        2000
      );
      return () => clearInterval(interval);
    }
  }, [isPaused, banners]);

  return (
    <div className="container mx-auto pt-30">
      <div
        className="w-full h-[300px] md:h-[400px] overflow-hidden relative rounded-xl"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div
          className="flex transition-transform duration-500"
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
        >
          {banners.map((banner, index) => (
            <div key={index} className="w-full flex-shrink-0">
              <img
                src={banner.banner_url}
                alt={banner.location}
                className="w-full h-full object-cover rounded-xl"
              />
            </div>
          ))}
        </div>

        {/* Arrows */}
        <button
          className="absolute left-3 top-1/2 -translate-y-1/2 text-white text-3xl"
          onClick={() =>
            setActiveIndex(
              (prev) => (prev - 1 + banners.length) % banners.length
            )
          }
        >
          <FiChevronLeft />
        </button>
        <button
          className="absolute right-3 top-1/2 -translate-y-1/2 text-white text-3xl"
          onClick={() => setActiveIndex((prev) => (prev + 1) % banners.length)}
        >
          <FiChevronRight />
        </button>

        {/* Dots */}
        <div className="absolute bottom-2 w-full flex justify-center gap-2">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`w-3 h-3 rounded-full ${
                i === activeIndex ? "bg-green-500" : "bg-gray-300"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Banner;
