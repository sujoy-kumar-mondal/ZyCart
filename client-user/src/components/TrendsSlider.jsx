import React, { useEffect, useState, useRef } from "react";
import Slider from "react-slick";
import { motion } from "framer-motion";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import axios from "../utils/axiosInstance.js";
import ProductCard from "./ProductCard";
import Loader from "./Loader";

const TrendsSlider = ({ type, title }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [slidesToShow, setSlidesToShow] = useState(getInitialSlides());
  const sliderRef = useRef(null);

  // Determine slides based on window width
  function getInitialSlides() {
    if (typeof window !== "undefined") {
      const width = window.innerWidth;
      if (width < 512) return 1;
      if (width < 1024) return 2;
      if (width < 1200) return 3;
    }
    return 4;
  }

  // Fetch trends data
  useEffect(() => {
    const fetchTrends = async () => {
      try {
        const endpoint = type === "purchase" ? "/products/trends/top-purchase" : "/products/trends/top-views";
        const response = await axios.get(endpoint);
        setProducts(response.data.trends || []);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    fetchTrends();
  }, [type]);

  // Handle window resize for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      setSlidesToShow(getInitialSlides());
      if (sliderRef.current) {
        sliderRef.current.slickGoTo(0);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    arrows: typeof window !== "undefined" && window.innerWidth > 768,
    responsive: [
      { breakpoint: 1200, settings: { slidesToShow: 3, slidesToScroll: 1, arrows: true } },
      { breakpoint: 1024, settings: { slidesToShow: 2, slidesToScroll: 1, arrows: false } },
      { breakpoint: 512, settings: { slidesToShow: 1, slidesToScroll: 1, arrows: false } },
    ],
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <Loader />
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className="text-center py-16 text-gray-600">
        <p className="text-lg">No trending products yet</p>
      </div>
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mb-20"
    >
      <div className="mb-10">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[#1B2A41] mb-2">
          {title}
        </h2>
        <p className="text-gray-600 text-lg">
          {type === "purchase"
            ? "Most purchased products by our customers"
            : "Most viewed products trending right now"}
        </p>
      </div>

      <div className="bg-white rounded-2xl p-4 md:p-8 shadow-lg border border-gray-200 w-full overflow-hidden">
        <style>{`
          /* Slider Container */
          .trends-slider {
            width: 100%;
            padding: 0 20px;
          }

          @media (max-width: 768px) {
            .trends-slider {
              padding: 0 10px;
            }
          }

          /* Slider Base Styles */
          .slick-slider {
            margin: 0;
            padding: 0;
          }

          .slick-track {
            display: flex;
            margin: 0;
          }

          /* Slide Styling */
          .slick-slide {
            padding: 0 10px;
            margin: 0;
            width: 100% !important;
            box-sizing: border-box;
            display: block !important;
          }

          @media (max-width: 512px) {
            .slick-slide {
              padding: 0 5px !important;
              margin: 0 !important;
            }
          }

          /* Dots Navigation */
          .slick-dots {
            bottom: -50px;
            padding: 0;
          }

          .slick-dots li {
            margin: 0 6px;
          }

          .slick-dots li button:before {
            color: #d1d5db;
            font-size: 10px;
            transition: all 0.3s ease;
          }

          .slick-dots li.slick-active button:before {
            color: #4f46e5;
            transform: scale(1.3);
          }

          /* Arrow Navigation */
          .slick-prev,
          .slick-next {
            width: 40px;
            height: 40px;
            top: 50%;
            transform: translateY(-50%);
            z-index: 1;
            background: #4f46e5;
            border-radius: 50%;
            transition: all 0.3s ease;
            display: flex !important;
            align-items: center;
            justify-content: center;
          }

          .slick-prev {
            left: -50px;
          }

          .slick-next {
            right: -50px;
          }

          .slick-prev:hover,
          .slick-next:hover {
            background: #4338ca;
            transform: translateY(-50%) scale(1.1);
          }

          .slick-prev:before,
          .slick-next:before {
            color: white;
            font-size: 20px;
          }

          .slick-prev:hover:before,
          .slick-next:hover:before {
            color: white;
          }

          @media (max-width: 768px) {
            .slick-prev,
            .slick-next {
              display: none !important;
            }
          }

          /* Product Card Hover Effect */
          .trends-slider .slick-slide {
            transition: transform 0.3s ease;
          }

          .trends-slider .slick-slide:hover {
            transform: translateY(-8px);
          }

          @media (max-width: 512px) {
            .trends-slider .slick-slide:hover {
              transform: translateY(0);
            }
          }
        `}</style>
        <div className="trends-slider">
          <Slider ref={sliderRef} {...sliderSettings}>
            {products.map((trend, index) => (
              <div key={trend._id || index} className="px-2 md:px-3 py-4 w-full">
                <div className="bg-linear-to-br from-white to-gray-50 rounded-xl p-4 md:p-5 shadow-sm hover:shadow-xl transition-all duration-300 ease-in-out h-full border border-gray-100">
                  <ProductCard product={trend.product} />
                  <div className="mt-3 md:mt-4 text-center space-y-2">
                    <p className="text-xs md:text-sm font-semibold text-gray-800 line-clamp-2 h-8">
                      {trend.product?.name || "Product"}
                    </p>
                    <div className="text-xs md:text-sm text-gray-600 font-medium">
                      {type === "purchase" ? (
                        <span className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                          📊 {trend.noOfPurchase} purchases
                        </span>
                      ) : (
                        <span className="inline-block bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full">
                          👁️ {trend.noOfViews} views
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </Slider>
        </div>
      </div>
    </motion.section>
  );
};

export default TrendsSlider;
