import React, { useEffect, useState } from "react";
import axios from "../../utils/axiosInstance.js";
import Loader from "../../components/Loader";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // FETCH USERS
  const fetchUsers = async () => {
    try {
      const res = await axios.get("/admin/users");
      setUsers(res.data.users || []);
    } catch (error) {
      console.error("Users fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // BAN USER
  const banUser = async (id) => {
    if (!window.confirm("Ban this user?")) return;
    try {
      await axios.patch(`/admin/users/ban/${id}`);
      fetchUsers();
    } catch (error) {
      alert("Failed to ban user.");
    }
  };

  // UNBAN USER
  const unbanUser = async (id) => {
    try {
      await axios.patch(`/admin/users/unban/${id}`);
      fetchUsers();
    } catch (error) {
      alert("Failed to unban user.");
    }
  };

  // DELETE USER
  const deleteUser = async (id) => {
    if (!window.confirm("Delete user permanently?")) return;
    try {
      await axios.delete(`/admin/users/${id}`);
      fetchUsers();
    } catch (error) {
      alert("Failed to delete user.");
    }
  };

  useEffect(() => {
    document.title = "Users | ZyCart";
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="max-w-screen-2xl container mx-auto px-4 md:px-14 space-y-10 py-10">

      <h1
        className="
          text-4xl font-extrabold
          bg-linear-to-r from-[#6A8EF0] to-[#3F51F4]
          text-transparent bg-clip-text
        "
      >
        Manage Users
      </h1>

      <div
        className="
          p-8 rounded-2xl shadow-lg
          bg-white/60 backdrop-blur-xl
          border border-[#8FD6F6]/40
          overflow-x-auto
        "
      >
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-300 text-gray-700">
              <th className="py-3">Name</th>
              <th>Email</th>
              <th>Mobile</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {users.map((u) => (
              <tr
                key={u._id}
                className="border-b border-gray-200 hover:bg-gray-50 transition text-gray-700"
              >
                <td className="py-3 font-medium">{u.name}</td>

                <td>{u.email}</td>

                <td>{u.mobile || "-"}</td>

                <td>
                  <span
                    className={`
                      px-3 py-1 rounded-lg text-white text-xs font-medium
                      ${u.isBanned
                        ? "bg-linear-to-r from-red-500 to-red-700"
                        : "bg-linear-to-r from-green-400 to-green-600"
                      }
                    `}
                  >
                    {u.isBanned ? "Banned" : "Active"}
                  </span>
                </td>

                <td className="text-right space-x-4">

                  {!u.isBanned ? (
                    <button
                      onClick={() => banUser(u._id)}
                      className="text-red-600 hover:underline font-semibold"
                    >
                      Ban
                    </button>
                  ) : (
                    <button
                      onClick={() => unbanUser(u._id)}
                      className="text-green-600 hover:underline font-semibold"
                    >
                      Unban
                    </button>
                  )}

                  <button
                    onClick={() => deleteUser(u._id)}
                    className="text-gray-600 hover:underline font-semibold"
                  >
                    Delete
                  </button>

                </td>
              </tr>
            ))}
          </tbody>

        </table>
      </div>
    </div>
  );
};

export default AdminUsers;
