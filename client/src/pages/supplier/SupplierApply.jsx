import React, { useEffect, useState } from "react";
import axios from "../../utils/axiosInstance.js";
import { useNavigate } from "react-router-dom";

const SupplierApply = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    shopName: "",
    shopType: "",
    pan: "",
    aadhar: "",
    bankAccount: "",
    gst: "",
    license: null,
  });
  
  useEffect(() => {
    document.title = "Become a Supplier | ZyCart";
  }, []);

  // HANDLE INPUT CHANGE
  const handleChange = (e) => {
    if (e.target.name === "license") {
      setForm({ ...form, license: e.target.files[0] });
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };

  // SUBMIT APPLICATION
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !form.shopName ||
      !form.shopType ||
      !form.pan ||
      !form.aadhar ||
      !form.bankAccount ||
      !form.gst
    ) {
      return alert("Please fill all fields.");
    }

    setLoading(true);

    const data = new FormData();
    data.append("shopName", form.shopName);
    data.append("shopType", form.shopType);
    data.append("pan", form.pan);
    data.append("aadhar", form.aadhar);
    data.append("bankAccount", form.bankAccount);
    data.append("gst", form.gst);

    if (form.license) {
      data.append("license", form.license);
    }

    try {
      const res = await axios.post("/supplier/apply", data);

      if (res.data.success) {
        alert("Application submitted! Wait for admin approval.");
        navigate("/");
      }
    } catch (error) {
      alert(error.response?.data?.message || "Application failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-screen-2xl container mx-auto px-4 md:px-14">

      <div
        className="
          max-w-2xl mx-auto mt-14 p-10 rounded-2xl shadow-xl
          bg-white/60 backdrop-blur-xl border border-[#8FD6F6]/40
        "
      >
        <h1
          className="
            text-4xl font-extrabold text-center mb-8
            bg-linear-to-r from-[#6A8EF0] to-[#3F51F4]
            text-transparent bg-clip-text
          "
        >
          Become a Supplier
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Shop Name */}
          <div>
            <label className="font-medium text-gray-700">Shop Name</label>
            <input
              type="text"
              name="shopName"
              className="
                w-full mt-1 px-4 py-3 rounded-xl bg-gray-100 border
                border-gray-300 focus:border-[#6A8EF0] outline-none transition
              "
              value={form.shopName}
              onChange={handleChange}
            />
          </div>

          {/* Shop Type */}
          <div>
            <label className="font-medium text-gray-700">Shop Type</label>
            <select
              name="shopType"
              className="
                w-full mt-1 px-4 py-3 rounded-xl bg-gray-100 border
                border-gray-300 focus:border-[#6A8EF0] outline-none transition
              "
              value={form.shopType}
              onChange={handleChange}
            >
              <option value="">Select Type</option>
              <option value="Electronics & Accessories">Electronics & Accessories</option>
              <option value="Fashion and Beauty">Fashion and Beauty</option>
              <option value="Home and Kitchen">Home and Kitchen</option>
              <option value="Health and Fitness">Health and Fitness</option>
              <option value="Books">Books</option>
            </select>
          </div>

          {/* PAN & Aadhar */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="font-medium text-gray-700">PAN</label>
              <input
                type="text"
                name="pan"
                className="
                  w-full mt-1 px-4 py-3 rounded-xl bg-gray-100 border
                  border-gray-300 focus:border-[#6A8EF0]
                "
                value={form.pan}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="font-medium text-gray-700">Aadhar</label>
              <input
                type="text"
                name="aadhar"
                className="
                  w-full mt-1 px-4 py-3 rounded-xl bg-gray-100 border
                  border-gray-300 focus:border-[#6A8EF0]
                "
                value={form.aadhar}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Bank Account */}
          <div>
            <label className="font-medium text-gray-700">Bank Account</label>
            <input
              type="text"
              name="bankAccount"
              className="
                w-full mt-1 px-4 py-3 rounded-xl bg-gray-100 border
                border-gray-300 focus:border-[#6A8EF0]
              "
              value={form.bankAccount}
              onChange={handleChange}
            />
          </div>

          {/* GST */}
          <div>
            <label className="font-medium text-gray-700">GST Number</label>
            <input
              type="text"
              name="gst"
              className="
                w-full mt-1 px-4 py-3 rounded-xl bg-gray-100 border
                border-gray-300 focus:border-[#6A8EF0]
              "
              value={form.gst}
              onChange={handleChange}
            />
          </div>

          {/* License Upload */}
          <div>
            <label className="font-medium text-gray-700">Upload License</label>
            <input
              type="file"
              name="license"
              accept="image/*,.pdf"
              className="
                w-full mt-1 px-4 py-3 rounded-xl bg-gray-100 border
                border-gray-300 focus:border-[#6A8EF0]
              "
              onChange={handleChange}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="
              w-full py-3 text-lg font-semibold text-white rounded-xl shadow-md
              bg-linear-to-r from-[#6A8EF0] to-[#3F51F4]
              hover:opacity-90 transition
            "
          >
            {loading ? "Submitting..." : "Submit Application"}
          </button>
        </form>
      </div>

    </div>
  );
};

export default SupplierApply;
