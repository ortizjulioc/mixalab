'use client';

import { useRouter, useSearchParams } from "next/navigation";
import { debounce } from "./useDebounce";
import { useCallback, useEffect, useRef, useState } from "react";
import { openNotification } from "../utils/open-notification";
import { fetchClient } from "../utils/fetchClient";

export default function useServiceRequests() {
    const [serviceRequests, setServiceRequests] = useState([]);
    const [serviceRequest, setServiceRequest] = useState(null);
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const router = useRouter();

    const [filters, setFilters] = useState({
        page: Number(searchParams.get("page")) || 1,
        search: searchParams.get("search") || "",
        status: searchParams.get("status") || "",
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

    // Fetch all service requests with pagination and filters
    const fetchServiceRequests = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const res = await fetchClient({
                method: "GET",
                endpoint: "/service-requests",
                params: {
                    page: filters.page.toString(),
                    limit: "10",
                    ...(filters.search && { search: filters.search }),
                    ...(filters.status && { status: filters.status }),
                },
            });

            setServiceRequests(res.items || []);
            setPagination({
                total: res.pagination.total,
                currentPage: res.pagination.page,
                limit: res.pagination.limit,
                totalPages: res.pagination.pages,
            });
            setError(null);
        } catch (err) {
            console.error("Error fetching service requests:", err);
            setError(err?.error?.message || "Error loading service requests");
            openNotification("error", err?.error?.message || "Error fetching service requests");
        } finally {
            setLoading(false);
        }
    }, [filters]);

    // Fetch single service request by ID
    const fetchServiceRequestById = useCallback(async (id) => {
        setLoading(true);
        setError(null);

        try {
            const res = await fetchClient({
                method: "GET",
                endpoint: `/service-requests/${id}`,
            });

            setServiceRequest(res);
            setError(null);
            return res;
        } catch (err) {
            console.error("Error fetching service request:", err);
            setError(err?.error?.message || "Error loading service request");
            openNotification("error", err?.error?.message || "Error fetching service request");
        } finally {
            setLoading(false);
        }
    }, []);

    // Get service requests by user ID
    const getServiceRequestsByUserId = useCallback(async (userId) => {
        setLoading(true);
        setError(null);

        try {
            const res = await fetchClient({
                method: "GET",
                endpoint: "/service-requests",
                params: { userId },
            });

            const requests = res.items || [];
            setServiceRequests(requests);
            setError(null);
            return requests;
        } catch (err) {
            console.log('Error fetching service requests by userId:', err);

            const errorMessage = err?.error?.message || 'Error loading service requests';
            const isNotFound =
                typeof errorMessage === 'string' &&
                (errorMessage.toLowerCase().includes('not found') ||
                    errorMessage.toLowerCase().includes('404'));

            if (isNotFound) {
                // No requests found - this is expected for new users
                console.log('No service requests found for user');
                setError(null);
                setServiceRequests([]);
            } else {
                // Actual error - show notification
                console.error('Actual error fetching service requests:', errorMessage);
                setError(errorMessage);
                openNotification("error", errorMessage);
                setServiceRequests([]);
            }

            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    // Create new service request
    const createServiceRequest = useCallback(async (requestData, files = {}) => {
        try {
            // Create FormData for multipart/form-data
            const formData = new FormData();

            // Add all basic fields
            formData.append('projectName', requestData.projectName);
            formData.append('artistName', requestData.artistName);
            formData.append('projectType', requestData.projectType);
            formData.append('tier', requestData.tier);
            formData.append('services', requestData.services);

            // Add optional fields
            if (requestData.description) {
                formData.append('description', requestData.description);
            }

            if (requestData.mixingType) {
                formData.append('mixingType', requestData.mixingType);
            }

            // Add arrays and objects as JSON strings
            if (requestData.genreIds && requestData.genreIds.length > 0) {
                formData.append('genreIds', JSON.stringify(requestData.genreIds));
            }

            if (requestData.addOns) {
                formData.append('addOns', JSON.stringify(requestData.addOns));
            }

            if (requestData.acceptance) {
                formData.append('acceptance', JSON.stringify(requestData.acceptance));
            }

            // Add files if provided
            if (files.demoFile) {
                formData.append('demoFile', files.demoFile);
            }

            if (files.stemsFile) {
                formData.append('stemsFile', files.stemsFile);
            }

            // Use fetch directly for FormData (fetchClient may add JSON headers)
            const response = await fetch('/api/service-requests', {
                method: 'POST',
                body: formData,
                // Don't set Content-Type header - browser will set it with boundary
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error creating service request');
            }

            const res = await response.json();
            openNotification("success", "Service request created successfully");
            return res;
        } catch (err) {
            console.error("Error creating service request:", err);
            openNotification("error", err.message || "Error creating service request");
            throw err;
        }
    }, []);

    // Update service request
    const updateServiceRequest = useCallback(async (id, requestData) => {
        try {
            const res = await fetchClient({
                method: "PUT",
                endpoint: `/service-requests/${id}`,
                data: requestData,
            });

            openNotification("success", "Service request updated successfully");
            return res;
        } catch (err) {
            console.error("Error updating service request:", err);
            openNotification("error", err?.error?.message || "Error updating service request");
            throw err;
        }
    }, []);

    // Delete service request
    const deleteServiceRequest = useCallback(async (id) => {
        try {
            await fetchClient({
                method: "DELETE",
                endpoint: `/service-requests/${id}`,
            });

            openNotification("success", "Service request deleted successfully");

            // Refresh the list after deletion
            fetchServiceRequests();
        } catch (err) {
            console.error("Error deleting service request:", err);
            openNotification("error", err?.error?.message || "Error deleting service request");
            throw err;
        }
    }, [fetchServiceRequests]);

    // Update service request status
    const updateServiceRequestStatus = useCallback(async (id, status) => {
        try {
            const res = await fetchClient({
                method: "PATCH",
                endpoint: `/service-requests/${id}/status`,
                data: { status },
            });

            openNotification("success", `Status updated to ${status}`);
            return res;
        } catch (err) {
            console.error("Error updating service request status:", err);
            openNotification("error", err?.error?.message || "Error updating status");
            throw err;
        }
    }, []);

    return {
        serviceRequests,
        serviceRequest,
        loading,
        error,
        pagination,
        filters,
        handleChangeFilter,
        fetchServiceRequests,
        fetchServiceRequestById,
        getServiceRequestsByUserId,
        createServiceRequest,
        updateServiceRequest,
        deleteServiceRequest,
        updateServiceRequestStatus,
    };
}
