import React, { useEffect, useState } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import axios from "../utils/axiosInstance.js";
import ProductCard from "./ProductCard";
import Loader from "./Loader";
import { motion } from "framer-motion";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const TrendsSlider = ({ type, title }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrends = async () => {
      try {
        let res;
        if (type === "purchase") {
          res = await axios.get("/products/trends/top-purchase");
        } else if (type === "views") {
          res = await axios.get("/products/trends/top-views");
        }
        setProducts(res.data.trends || []);
      } catch (error) {
        console.error(`Error loading ${type} trends:`, error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrends();
  }, [type]);

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    arrows: true,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
          arrows: true,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          arrows: false,
        },
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          arrows: false,
          centerMode: false,
          dots: true,
        },
      },
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
      className="mb-16"
    >
      <div className="mb-8">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-[#1B2A41]">
          {title}
        </h2>
        <p className="text-gray-600 mt-2">
          {type === "purchase"
            ? "Most purchased products by our customers"
            : "Most viewed products trending right now"}
        </p>
      </div>

      <div className="bg-white rounded-2xl p-3 md:p-6 shadow-lg border border-[#8FD6F6]/40 w-full overflow-hidden">
        <style>{`
          .trends-slider {
            width: 100%;
          }
          .slick-slider {
            margin: 0;
            padding: 0;
          }
          .slick-track {
            display: flex;
            margin: 0;
          }
          .slick-slide {
            padding: 0 6px;
            margin: 0;
            width: 100% !important;
          }
          @media (max-width: 768px) {
            .slick-slide {
              padding: 0 4px;
            }
          }
          @media (max-width: 640px) {
            .slick-slide {
              padding: 0 3px;
            }
          }
          .slick-dots {
            bottom: -30px;
          }
          .slick-dots li button:before {
            color: #6A8EF0;
            font-size: 10px;
          }
          .slick-dots li.slick-active button:before {
            color: #3F51F4;
          }
          .slick-prev,
          .slick-next {
            width: 35px;
            height: 35px;
            top: 50%;
            transform: translateY(-50%);
            z-index: 1;
          }
          .slick-prev {
            left: -40px;
          }
          .slick-next {
            right: -40px;
          }
          .slick-prev:before,
          .slick-next:before {
            color: #6A8EF0;
            font-size: 20px;
          }
          .slick-prev:hover:before,
          .slick-next:hover:before {
            color: #3F51F4;
          }
          @media (max-width: 768px) {
            .slick-prev,
            .slick-next {
              display: none !important;
            }
          }
        `}</style>
        <div className="trends-slider">
          <Slider {...settings}>
            {products.map((trend, index) => (
              <div key={trend._id || index} className="px-2 md:px-3 py-4">
                <ProductCard product={trend.product} />
                <div className="mt-2 md:mt-3 text-center text-xs md:text-sm text-gray-600 font-medium">
                  {type === "purchase" ? (
                    <span className="text-[#3F51F4]">
                      📊 {trend.noOfPurchase} purchases
                    </span>
                  ) : (
                    <span className="text-[#6A8EF0]">
                      👁️ {trend.noOfViews} views
                    </span>
                  )}
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
