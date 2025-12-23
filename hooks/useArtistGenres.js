'use client';

import { useRouter, useSearchParams } from "next/navigation";
import { debounce } from "./useDebounce";
import { useCallback, useEffect, useRef, useState } from "react";
import Swal from "sweetalert2";
import { openNotification } from "../utils/open-notification";
import { fetchClient } from "../utils/fetchClient";

export default function useArtistGenres() {
  const [artistGenres, setArtistGenres] = useState([]);
  const [artistGenre, setArtistGenre] = useState(null);
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  const [filters, setFilters] = useState({
    page: Number(searchParams.get("page")) || 1,
    artistId: searchParams.get("artistId") || "",
    genreId: searchParams.get("genreId") || "",
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

  // Fetch all artist genres
  const fetchArtistGenres = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams({
        page: filters.page.toString(),
        limit: "10",
        ...(filters.artistId && { artistId: filters.artistId }),
        ...(filters.genreId && { genreId: filters.genreId }),
      });

      const response = await fetchClient(
        `/api/artist-genres?${queryParams}`,
        { method: "GET" }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch artist genres");
      }

      const data = await response.json();
      setArtistGenres(data.items || []);
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
        message: "Error fetching artist genres",
      });
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Fetch single artist genre by ID
  const fetchArtistGenreById = useCallback(async (id) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetchClient(`/api/artist-genres/${id}`, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch artist genre");
      }

      const data = await response.json();
      setArtistGenre(data);
    } catch (err) {
      setError(err.message);
      openNotification({
        type: "error",
        message: "Error fetching artist genre",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Create new artist genre association
  const createArtistGenre = useCallback(async (associationData) => {
    try {
      const response = await fetchClient("/api/artist-genres", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(associationData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create artist genre association");
      }

      const newAssociation = await response.json();
      openNotification({
        type: "success",
        message: "Genre added to artist successfully",
      });
      return newAssociation;
    } catch (err) {
      openNotification({
        type: "error",
        message: err.message || "Error creating artist genre association",
      });
      throw err;
    }
  }, []);

  // Delete artist genre association
  const deleteArtistGenre = useCallback(async (id) => {
    const result = await Swal.fire({
      title: "Remove Genre",
      text: "Are you sure you want to remove this genre from the artist?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, remove it!",
    });

    if (!result.isConfirmed) return;

    try {
      const response = await fetchClient(`/api/artist-genres/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete artist genre");
      }

      openNotification({
        type: "success",
        message: "Genre removed from artist successfully",
      });

      // Refresh the list
      await fetchArtistGenres();
      return true;
    } catch (err) {
      openNotification({
        type: "error",
        message: err.message || "Error deleting artist genre",
      });
      throw err;
    }
  }, [fetchArtistGenres]);

  // Initial fetch
  useEffect(() => {
    fetchArtistGenres();
  }, [filters, fetchArtistGenres]);

  return {
    artistGenres,
    artistGenre,
    loading,
    error,
    pagination,
    filters,
    handleChangeFilter,
    fetchArtistGenres,
    fetchArtistGenreById,
    createArtistGenre,
    deleteArtistGenre,
  };
}
