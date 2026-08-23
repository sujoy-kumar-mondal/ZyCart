import React from "react";
import ProductCard from "./ProductCard.jsx";

const ProductList = ({ products = [] }) => {
  if (!products.length) {
    return (
      <div className="text-center py-20 text-lg text-slate-500 font-semibold bg-white rounded-3xl border border-slate-200/80">
        No products found.
      </div>
    );
  }

  return (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 items-stretch">
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
};

export default ProductList;
