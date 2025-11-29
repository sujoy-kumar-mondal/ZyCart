import React, { useEffect, useState } from "react";
import axios from "../../utils/axiosInstance.js";
import Loader from "../../components/Loader";

const SupplierProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    title: "",
    price: "",
    stock: "",
    description: "",
    image: null,
  });

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
    if (e.target.name === "image") {
      setForm({ ...form, image: e.target.files[0] });
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };

  // ADD PRODUCT
  const handleAdd = async () => {
    const data = new FormData();
    data.append("title", form.title);
    data.append("price", form.price);
    data.append("stock", form.stock);
    data.append("description", form.description);
    if (form.image) data.append("image", form.image);

    try {
      await axios.post("/supplier/products", data);
      alert("Product added successfully!");
      setForm({ title: "", price: "", stock: "", description: "", image: null });
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
      image: null,
    });
  };

  // UPDATE PRODUCT
  const handleUpdate = async () => {
    const data = new FormData();
    data.append("title", form.title);
    data.append("price", form.price);
    data.append("stock", form.stock);
    data.append("description", form.description);
    if (form.image) data.append("image", form.image);

    try {
      await axios.put(`/supplier/products/${editId}`, data);
      alert("Product updated successfully!");
      setIsEditing(false);
      setEditId(null);
      setForm({ title: "", price: "", stock: "", description: "", image: null });
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
    <div className="max-w-screen-2xl container mx-auto px-14 space-y-12">

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
            <label className="font-medium text-gray-700">Image</label>
            <input
              type="file"
              name="image"
              accept="image/*"
              className="
                w-full mt-1 px-4 py-3 rounded-xl bg-gray-100 border
                border-gray-300 focus:border-[#6A8EF0]
              "
              onChange={handleChange}
            />
          </div>
        </div>

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
        "
      >
        <h2 className="text-2xl font-semibold mb-6 text-[#1B2A41]">
          Your Products
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-300 text-gray-700">
                <th className="py-3">Image</th>
                <th>Title</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {products.map((p) => (
                <tr key={p._id} className="border-b text-gray-700">
                  <td className="py-3">
                    <img
                      src={p.images?.[0] || "/placeholder.png"}
                      alt="product"
                      className="w-14 h-14 object-cover rounded-lg shadow-sm"
                    />
                  </td>

                  <td className="font-medium">{p.title}</td>

                  <td className="font-semibold text-[#1B2A41]">
                    ₹{p.price}
                  </td>

                  <td>{p.stock}</td>

                  <td>
                    <span
                      className={`
                        px-3 py-1 rounded-lg text-xs text-white font-medium
                        ${p.isAvailable
                          ? "bg-linear-to-r from-green-400 to-green-600"
                          : "bg-gray-500"
                        }
                      `}
                    >
                      {p.isAvailable ? "Available" : "Unavailable"}
                    </span>
                  </td>

                  <td className="text-right space-x-4">
                    <button
                      onClick={() => handleEdit(p)}
                      className="text-[#3F51F4] hover:underline font-semibold"
                    >
                      Edit
                    </button>

                    {p.isAvailable && (
                      <button
                        onClick={() => markUnavailable(p._id)}
                        className="text-red-600 hover:underline font-semibold"
                      >
                        Mark Unavailable
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      </div>
    </div>
  );
};

export default SupplierProducts;
