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

  // Fetch all artist profiles
  const fetchArtistProfiles = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams({
        page: filters.page.toString(),
        limit: "10",
        ...(filters.search && { search: filters.search }),
      });

      const response = await fetchClient(
        `/api/artist-profiles?${queryParams}`,
        { method: "GET" }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch artist profiles");
      }

      const data = await response.json();
      setArtistProfiles(data.items || []);
      setPagination({
        total: data.pagination.total,
        currentPage: data.pagination.page,
        limit: data.pagination.limit,
        totalPages: data.pagination.pages,
      });
    } catch (err) {
      setError(err.message);
      openNotification({
        type: "error",
        message: "Error fetching artist profiles",
      });
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Fetch single artist profile by ID
  const fetchArtistProfileById = useCallback(async (id) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetchClient(`/api/artist-profiles/${id}`, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch artist profile");
      }

      const data = await response.json();
      setArtistProfile(data);
    } catch (err) {
      setError(err.message);
      openNotification({
        type: "error",
        message: "Error fetching artist profile",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Create new artist profile
  const createArtistProfile = useCallback(async (profileData) => {
    try {
      const response = await fetchClient("/api/artist-profiles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create artist profile");
      }

      const newProfile = await response.json();
      openNotification({
        type: "success",
        message: "Artist profile created successfully",
      });
      return newProfile;
    } catch (err) {
      openNotification({
        type: "error",
        message: err.message || "Error creating artist profile",
      });
      throw err;
    }
  }, []);

  // Update artist profile
  const updateArtistProfile = useCallback(async (id, profileData) => {
    try {
      const response = await fetchClient(`/api/artist-profiles/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update artist profile");
      }

      const updatedProfile = await response.json();
      setArtistProfile(updatedProfile);
      openNotification({
        type: "success",
        message: "Artist profile updated successfully",
      });
      return updatedProfile;
    } catch (err) {
      openNotification({
        type: "error",
        message: err.message || "Error updating artist profile",
      });
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
      const response = await fetchClient(`/api/artist-profiles/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete artist profile");
      }

      openNotification({
        type: "success",
        message: "Artist profile deleted successfully",
      });

      // Refresh the list
      await fetchArtistProfiles();
      return true;
    } catch (err) {
      openNotification({
        type: "error",
        message: err.message || "Error deleting artist profile",
      });
      throw err;
    }
  }, [fetchArtistProfiles]);

  // Get artist profile by user ID
  const getArtistProfileByUserId = useCallback(async (userId) => {
    try {
      setLoading(true);
      const response = await fetchClient(`/api/artist-profiles?userId=${userId}`, {
        method: "GET",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch artist profile");
      }

      const data = await response.json();
      // El endpoint retorna { items, pagination }, tomamos el primer item
      const profile = data.items && data.items.length > 0 ? data.items[0] : null;
      setArtistProfile(profile);
      setError(null);
      return profile;
    } catch (err) {
      console.log('Error fetching artist profile by userId:', err);

      const errorMessage = err?.message || 'Error loading artist profile';
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
        openNotification({
          type: "error",
          message: errorMessage,
        });
        setArtistProfile(null);
      }

      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchArtistProfiles();
  }, [filters, fetchArtistProfiles]);

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
