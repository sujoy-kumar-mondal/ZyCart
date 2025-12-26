import React, { useEffect, useState } from "react";
import axios from "../../utils/axiosInstance.js";
import Loader from "../../components/Loader";

const SupplierProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const [form, setForm] = useState({
    title: "",
    price: "",
    stock: "",
    description: "",
    images: [],
  });

  const [imagePreviews, setImagePreviews] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  // FETCH PRODUCTS
  const fetchProducts = async () => {
    try {
      const res = await axios.get("/supplier/products");
      setProducts(res.data.products || []);
    } catch (error) {
      console.error("Product fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // INPUT HANDLER
  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "images") {
      const selectedFiles = Array.from(files).slice(0, 5); // Max 5 images
      setForm({ ...form, images: selectedFiles });

      // Create previews
      const previews = selectedFiles.map((file) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        return new Promise((resolve) => {
          reader.onload = () => resolve(reader.result);
        });
      });

      Promise.all(previews).then(setImagePreviews);
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  // ADD PRODUCT
  const handleAdd = async () => {
    if (!form.title || !form.price || !form.stock) {
      alert("Title, price, and stock are required!");
      return;
    }

    const data = new FormData();
    data.append("title", form.title);
    data.append("price", form.price);
    data.append("stock", form.stock);
    data.append("description", form.description);

    // Add multiple images
    form.images.forEach((image) => {
      data.append("images", image);
    });

    try {
      await axios.post("/supplier/products", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Product added successfully!");
      setForm({ title: "", price: "", stock: "", description: "", images: [] });
      setImagePreviews([]);
      fetchProducts();
    } catch (error) {
      alert(error.response?.data?.message || "Add product failed!");
    }
  };

  // EDIT PRODUCT
  const handleEdit = (product) => {
    setIsEditing(true);
    setEditId(product._id);
    setForm({
      title: product.title,
      price: product.price,
      stock: product.stock,
      description: product.description,
      images: [],
    });
    setImagePreviews([]);
  };

  // UPDATE PRODUCT
  const handleUpdate = async () => {
    if (!form.title || !form.price || !form.stock) {
      alert("Title, price, and stock are required!");
      return;
    }

    const data = new FormData();
    data.append("title", form.title);
    data.append("price", form.price);
    data.append("stock", form.stock);
    data.append("description", form.description);

    // Add multiple images if any
    form.images.forEach((image) => {
      data.append("images", image);
    });

    try {
      await axios.put(`/supplier/products/${editId}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Product updated successfully!");
      setIsEditing(false);
      setEditId(null);
      setForm({ title: "", price: "", stock: "", description: "", images: [] });
      setImagePreviews([]);
      fetchProducts();
    } catch (error) {
      alert(error.response?.data?.message || "Update failed!");
    }
  };

  // MARK UNAVAILABLE
  const markUnavailable = async (id) => {
    if (!window.confirm("Mark this product as unavailable?")) return;

    try {
      await axios.patch(`/supplier/products/unavailable/${id}`);
      fetchProducts();
    } catch (error) {
      alert("Failed to update product availability!");
    }
  };

  useEffect(() => {
    document.title = "Products | ZyCart";
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="max-w-screen-2xl container mx-auto px-4 md:px-14 space-y-12">

      {/* Heading */}
      <h1
        className="
          text-4xl font-extrabold
          bg-linear-to-r from-[#6A8EF0] to-[#3F51F4]
          text-transparent bg-clip-text
        "
      >
        Manage Products
      </h1>

      {/* FORM CARD */}
      <div
        className="
          p-8 rounded-2xl shadow-lg
          bg-white/60 backdrop-blur-xl
          border border-[#8FD6F6]/40
          space-y-6
        "
      >
        <h2 className="text-2xl font-semibold text-[#1B2A41]">
          {isEditing ? "Edit Product" : "Add New Product"}
        </h2>

        <div className="grid md:grid-cols-2 gap-5">
          <div>
            <label className="font-medium text-gray-700">Title</label>
            <input
              type="text"
              name="title"
              className="
                w-full mt-1 px-4 py-3 rounded-xl bg-gray-100 border
                border-gray-300 focus:border-[#6A8EF0] outline-none transition
              "
              value={form.title}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="font-medium text-gray-700">Price</label>
            <input
              type="number"
              name="price"
              className="
                w-full mt-1 px-4 py-3 rounded-xl bg-gray-100 border
                border-gray-300 focus:border-[#6A8EF0]
              "
              value={form.price}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="font-medium text-gray-700">Stock</label>
            <input
              type="number"
              name="stock"
              className="
                w-full mt-1 px-4 py-3 rounded-xl bg-gray-100 border
                border-gray-300 focus:border-[#6A8EF0]
              "
              value={form.stock}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="font-medium text-gray-700">
              Images (Max 5)
            </label>
            <input
              type="file"
              name="images"
              accept="image/*"
              multiple
              className="
                w-full mt-1 px-4 py-3 rounded-xl bg-gray-100 border
                border-gray-300 focus:border-[#6A8EF0]
              "
              onChange={handleChange}
            />
            <p className="text-sm text-gray-500 mt-2">
              {form.images.length}/5 images selected
            </p>
          </div>
        </div>

        {/* IMAGE PREVIEWS */}
        {imagePreviews.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-medium text-gray-700">Image Previews</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {imagePreviews.map((preview, idx) => (
                <div
                  key={idx}
                  className="relative rounded-xl overflow-hidden border border-gray-300 shadow-sm"
                >
                  <img
                    src={preview}
                    alt={`Preview ${idx + 1}`}
                    className="w-full h-24 object-cover"
                  />
                  <span className="absolute top-1 right-1 bg-blue-600 text-white text-xs font-semibold px-2 py-1 rounded">
                    {idx + 1}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="font-medium text-gray-700">Description</label>
          <textarea
            name="description"
            rows="3"
            className="
              w-full mt-1 px-4 py-3 rounded-xl bg-gray-100 border
              border-gray-300 focus:border-[#6A8EF0]
            "
            value={form.description}
            onChange={handleChange}
          ></textarea>
        </div>

        <button
          onClick={isEditing ? handleUpdate : handleAdd}
          className="
            w-full py-3 rounded-xl text-white text-lg font-semibold shadow-md
            bg-linear-to-r from-[#6A8EF0] to-[#3F51F4]
            hover:opacity-90 transition
          "
        >
          {isEditing ? "Update Product" : "Add Product"}
        </button>
      </div>

      {/* PRODUCT LIST TABLE */}
      <div
        className="
          p-8 rounded-2xl shadow-lg
          bg-white/60 backdrop-blur-xl
          border border-[#8FD6F6]/40
          space-y-6
        "
      >
        {/* HEADER WITH STATS */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-[#1B2A41]">
            Your Products
          </h2>
          <div className="text-sm text-gray-600 font-medium">
            Total: <span className="text-[#3F51F4] font-bold">{products.length}</span>
          </div>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No products added yet. Add your first product!</p>
          </div>
        ) : (
          <>
            {/* PAGINATION INFO */}
            <div className="flex justify-between items-center text-sm text-gray-600 pb-4 border-b border-gray-300">
              <span>
                Showing {Math.min((currentPage - 1) * itemsPerPage + 1, products.length)} to{" "}
                {Math.min(currentPage * itemsPerPage, products.length)} of{" "}
                <span className="font-semibold text-[#1B2A41]">{products.length}</span>
              </span>
            </div>

            {/* TABLE */}
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b-2 border-gray-300 text-gray-700 bg-gray-50/50">
                    <th className="py-4 px-4 font-semibold">Image</th>
                    <th className="py-4 px-4 font-semibold">Title</th>
                    <th className="py-4 px-4 font-semibold">Price</th>
                    <th className="py-4 px-4 font-semibold">Stock</th>
                    <th className="py-4 px-4 font-semibold">Status</th>
                    <th className="py-4 px-4 text-right font-semibold">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {products
                    .slice(
                      (currentPage - 1) * itemsPerPage,
                      currentPage * itemsPerPage
                    )
                    .map((p) => (
                      <tr 
                        key={p._id} 
                        className="border-b border-gray-200 hover:bg-blue-50/30 transition"
                      >
                        <td className="py-4 px-4">
                          <img
                            src={p.images?.[0] || "/placeholder.png"}
                            alt="product"
                            className="w-14 h-14 object-cover rounded-lg shadow-sm border border-gray-200"
                          />
                        </td>

                        <td className="py-4 px-4 font-medium text-gray-800 max-w-xs truncate">
                          {p.title}
                        </td>

                        <td className="py-4 px-4 font-semibold text-[#3F51F4]">
                          ₹{p.price}
                        </td>

                        <td className="py-4 px-4 text-gray-700">
                          <span className={p.stock > 0 ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                            {p.stock}
                          </span>
                        </td>

                        <td className="py-4 px-4">
                          <span
                            className={`
                              px-3 py-1.5 rounded-lg text-xs text-white font-semibold
                              ${p.isAvailable
                                ? "bg-linear-to-r from-green-400 to-green-600"
                                : "bg-gray-400"
                              }
                            `}
                          >
                            {p.isAvailable ? "Available" : "Unavailable"}
                          </span>
                        </td>

                        <td className="py-4 px-4 text-right space-x-3">
                          <button
                            onClick={() => handleEdit(p)}
                            className="text-[#3F51F4] hover:text-[#3F51F4]/70 font-semibold text-sm hover:underline transition"
                          >
                            Edit
                          </button>

                          {p.isAvailable && (
                            <button
                              onClick={() => markUnavailable(p._id)}
                              className="text-red-600 hover:text-red-700 font-semibold text-sm hover:underline transition"
                            >
                              Unavailable
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {/* PAGINATION CONTROLS */}
            {products.length > itemsPerPage && (
              <div className="flex flex-col md:flex-row gap-4 md:justify-between md:items-center pt-6 border-t border-gray-300">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 transition order-1 md:order-0"
                >
                  ← Prev
                </button>

                <div className="flex gap-2 flex-wrap justify-center md:justify-start order-3 md:order-0">
                  {Array.from({
                    length: Math.ceil(products.length / itemsPerPage),
                  }).map((_, idx) => (
                    <button
                      key={idx + 1}
                      onClick={() => setCurrentPage(idx + 1)}
                      className={`
                        px-3 py-2 rounded-lg font-semibold text-sm md:text-base transition
                        ${currentPage === idx + 1
                          ? "bg-linear-to-r from-[#6A8EF0] to-[#3F51F4] text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }
                      `}
                    >
                      {idx + 1}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() =>
                    setCurrentPage(
                      Math.min(
                        Math.ceil(products.length / itemsPerPage),
                        currentPage + 1
                      )
                    )
                  }
                  disabled={
                    currentPage === Math.ceil(products.length / itemsPerPage)
                  }
                  className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 transition order-2 md:order-0"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SupplierProducts;
