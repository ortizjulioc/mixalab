'use client';

import { useRouter, useSearchParams } from "next/navigation";
import { debounce } from "./useDebounce";
import { useCallback, useEffect, useRef, useState } from "react";
import Swal from "sweetalert2";
import { openNotification } from "../utils/open-notification";
import { fetchClient } from "../utils/fetchClient";

export default function useArtistProfiles() {
  const [artistProfiles, setArtistProfiles] = useState([]);
  const [artistProfile, setArtistProfile] = useState(null);
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
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

  // Fetch all artist profiles
  const fetchArtistProfiles = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetchClient({
        method: "GET",
        endpoint: "/artist-profiles",
        params: {
          page: filters.page.toString(),
          limit: "10",
          ...(filters.search && { search: filters.search }),
        },
      });

      setArtistProfiles(res.items || []);
      setPagination({
        total: res.pagination.total,
        currentPage: res.pagination.page,
        limit: res.pagination.limit,
        totalPages: res.pagination.pages,
      });
      setError(null);
    } catch (err) {
      console.error("Error fetching artist profiles:", err);
      setError(err?.error?.message || "Error loading artist profiles");
      openNotification("error", err?.error?.message || "Error fetching artist profiles");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Fetch single artist profile by ID
  const fetchArtistProfileById = useCallback(async (id) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetchClient({
        method: "GET",
        endpoint: `/artist-profiles/${id}`,
      });

      setArtistProfile(res);
      setError(null);
      return res;
    } catch (err) {
      console.error("Error fetching artist profile:", err);
      setError(err?.error?.message || "Error loading artist profile");
      openNotification("error", err?.error?.message || "Error fetching artist profile");
    } finally {
      setLoading(false);
    }
  }, []);

  // Create new artist profile
  const createArtistProfile = useCallback(async (profileData) => {
    try {
      const res = await fetchClient({
        method: "POST",
        endpoint: "/artist-profiles",
        data: profileData,
      });

      openNotification("success", "Artist profile created successfully");
      return res;
    } catch (err) {
      console.error("Error creating artist profile:", err);
      openNotification("error", err?.error?.message || "Error creating artist profile");
      throw err;
    }
  }, []);

  // Update artist profile
  const updateArtistProfile = useCallback(async (id, profileData) => {
    try {
      const res = await fetchClient({
        method: "PUT",
        endpoint: `/artist-profiles/${id}`,
        data: profileData,
      });

      setArtistProfile(res);
      openNotification("success", "Artist profile updated successfully");
      return res;
    } catch (err) {
      console.error("Error updating artist profile:", err);
      openNotification("error", err?.error?.message || "Error updating artist profile");
      throw err;
    }
  }, []);

  // Delete artist profile
  const deleteArtistProfile = useCallback(async (id) => {
    const result = await Swal.fire({
      title: "Delete Artist Profile",
      text: "Are you sure you want to delete this artist profile?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (!result.isConfirmed) return;

    try {
      await fetchClient({
        method: "DELETE",
        endpoint: `/artist-profiles/${id}`,
      });

      openNotification("success", "Artist profile deleted successfully");

      // Refresh the list
      await fetchArtistProfiles();
      return true;
    } catch (err) {
      console.error("Error deleting artist profile:", err);
      openNotification("error", err?.error?.message || "Error deleting artist profile");
      throw err;
    }
  }, [fetchArtistProfiles]);

  // Get artist profile by user ID
  const getArtistProfileByUserId = useCallback(async (userId) => {
    try {
      setLoading(true);
      const res = await fetchClient({
        method: "GET",
        endpoint: "/artist-profiles",
        params: { userId },
      });

      // El endpoint retorna { items, pagination }, tomamos el primer item
      const profile = res.items && res.items.length > 0 ? res.items[0] : null;
      setArtistProfile(profile);
      setError(null);
      return profile;
    } catch (err) {
      console.log('Error fetching artist profile by userId:', err);

      const errorMessage = err?.error?.message || 'Error loading artist profile';
      const isNotFound =
        typeof errorMessage === 'string' &&
        (errorMessage.toLowerCase().includes('not found') ||
          errorMessage.toLowerCase().includes('404'));

      if (isNotFound) {
        // User doesn't have a profile yet - this is expected, don't show error
        console.log('Artist profile not found - user needs to create one');
        setError(null);
        setArtistProfile(null);
      } else {
        // Actual error - show notification
        console.error('Actual error fetching artist profile:', errorMessage);
        setError(errorMessage);
        openNotification("error", errorMessage);
        setArtistProfile(null);
      }

      return null;
    } finally {
      setLoading(false);
    }
  }, []);



  return {
    artistProfiles,
    artistProfile,
    loading,
    error,
    pagination,
    filters,
    handleChangeFilter,
    fetchArtistProfiles,
    fetchArtistProfileById,
    getArtistProfileByUserId,
    createArtistProfile,
    updateArtistProfile,
    deleteArtistProfile,
  };
}
