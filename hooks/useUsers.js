'use client';

import { useRouter, useSearchParams } from "next/navigation";
import { debounce } from "./useDebounce";
import { useCallback, useEffect, useRef, useState } from "react";
import Swal from "sweetalert2";
import { openNotification } from "../utils/open-notification";
import { fetchClient } from "../utils/fetchClient";

export default function useUsers() {
  const [users, setUsers] = useState([]);
  const [user, setUser] = useState(null);
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  const [filters, setFilters] = useState({
    page: Number(searchParams.get("page")) || 1,
    search: searchParams.get("search") || "",
  });

  const [pagination, setPagination] = useState({
    total: 0,
    currentPage: 1,
    limit: 10,
    totalPages: 1,
  });

  const handleChangeFilter = (name, value, updateParams = true) => {
    const newFilters = { ...filters, [name]: value };

    setFilters(newFilters);

    if (updateParams) {
      debouncedUpdateParams(newFilters);
    }
  };

  const debouncedUpdateParams = useRef(
    debounce((newFilters) => {
      const params = new URLSearchParams();

      Object.entries(newFilters).forEach(([key, value]) => {
        if (value !== "" && value !== null && value !== undefined) {
          params.set(key, value.toString());
        }
      });

      router.push(`?${params.toString()}`, { scroll: false });
    }, 500)
  ).current;

  const debouncedFetchUsers = useRef(
    debounce(async (filters) => {
      try {
        const res = await fetchClient({
          method: "GET",
          endpoint: "/users",
          params: filters,
        });

        setUsers(res.users || res.data || []);
        setPagination(res.pagination);
        setError(null);
        return res;
      } catch (error) {
        console.error("Error fetching users:", error);
        setError("Error loading users");
        openNotification("error", error.message || "Error loading users");
        return error;
      } finally {
        setLoading(false);
      }
    }, 500)
  ).current;

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    debouncedFetchUsers(filters);
  }, [filters, debouncedFetchUsers]);

  const createUser = async (data) => {
    try {
      const res = await fetchClient({
        method: "POST",
        endpoint: "/users",
        data,
      });

      fetchUsers();
      openNotification("success", "User created successfully");
      return true;
    } catch (error) {
      console.error("Error creating user:", error);
      openNotification("error", error.message || "Error creating user");
      return error;
    }
  };

  const deleteUser = async (id) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
      allowOutsideClick: false,
      padding: "2em",
      background: "transparent",
      customClass: {
        container: "z-[9999] liquid-glass-container",
        popup:
          "liquid-glass rounded-2xl border border-white/20 shadow-2xl glow-border",
        title: "text-white font-bold",
        htmlContainer: "text-gray-200",
        confirmButton:
          "bg-red-600/50 hover:bg-red-700/50 border border-red-500/30 text-white rounded-xl transition-all duration-300",
        cancelButton:
          "bg-gray-600/50 hover:bg-gray-700/50 border border-gray-500/30 text-white rounded-xl transition-all duration-300",
      },
      didOpen: (popup) => {
        popup.querySelector(".swal2-icon")?.classList.add("scale-110");
      },
    });

    if (result.isConfirmed) {
      try {
        const res = await fetchClient({
          method: "DELETE",
          endpoint: `/users/${id}`,
        });

        fetchUsers();
        openNotification("success", "User deleted successfully");
        return true;
      } catch (error) {
        console.error("Error deleting user:", error);
        openNotification("error", error.message || "Error deleting user");
        return error;
      }
    }
  };

  const updateUser = async (id, data) => {
    try {
      const res = await fetchClient({
        method: "PUT",
        endpoint: `/users/${id}`,
        data,
      });

      fetchUsers();
      openNotification("success", "User updated successfully");
      return true;
    } catch (error) {
      console.error("Error updating user:", error);
      openNotification("error", error.message || "Error updating user");
      return error;
    }
  };

  const getUserById = useCallback(async (id) => {
    try {
      const res = await fetchClient({
        method: "GET",
        endpoint: `/users/${id}`,
      });

      setUser(res);
      return res;
    } catch (error) {
      console.error("Error fetching user:", error);
      openNotification("error", error.message || "Error loading user");
    }
  }, []);

  // ✅ Change password
  const changePassword = async (id, newPassword, repeatPassword) => {
    if (newPassword !== repeatPassword) {
      openNotification("error", "Passwords do not match");
      return false;
    }

    try {
      await fetchClient({
        method: "PUT",
        endpoint: `/users/${id}/password`,
        data: { newPassword,repeatPassword },
      });

      openNotification("success", "Password changed successfully");
      return true;
    } catch (error) {
      console.error("Error changing password:", error);
      openNotification("error", error.message || "Error changing password");
      return false;
    }
  };

  return {
    handleChangeFilter,
    filters,
    users,
    pagination,
    loading,
    error,
    user,
    fetchUsers,
    createUser,
    deleteUser,
    updateUser,
    getUserById,
    changePassword,
  };
}
