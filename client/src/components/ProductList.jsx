import React from "react";
import ProductCard from "./ProductCard.jsx";

const ProductList = ({ products = [] }) => {
  if (!products.length) {
    return (
      <div
        className="
          text-center py-20 text-lg
          text-gray-600
        "
      >
        No products found.
      </div>
    );
  }

  return (
    <div
      className="
        grid gap-7
        sm:grid-cols-2 
        md:grid-cols-3 
        lg:grid-cols-4
      "
    >
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
};

export default ProductList;
