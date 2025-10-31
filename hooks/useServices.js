'use client';

import { useRouter, useSearchParams } from "next/navigation";
import { debounce } from "./useDebounce"; // Ajusta la ruta si es necesario
import { useCallback, useEffect, useRef, useState } from "react";
import Swal from "sweetalert2";
import { openNotification } from "../utils/open-notification";
import { fetchClient } from "../utils/fetchClient";

export default function useServices() {
    const [services, setServices] = useState([]);
    const [service, setService] = useState(null);
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const router = useRouter();

    const [filters, setFilters] = useState({
        page: Number(searchParams.get('page')) || 1,
        search: searchParams.get('search') || '',
        serviceType: searchParams.get('serviceType') || '', // Filtro por tipo de servicio (opcional)
    });

    const [pagination, setPagination] = useState({
        total: 0,
        currentPage: 1,
        limit: 10,
        totalPages: 1
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
                if (value !== '' && value !== null && value !== undefined) {
                    params.set(key, value.toString());
                }
            });
            router.push(`?${params.toString()}`, { scroll: false });
        }, 500)
    ).current;

    const debouncedFetchServices = useRef(
        debounce(async (filters) => {
            try {
                const res = await fetchClient({
                    method: 'GET',
                    endpoint: '/services',
                    params: filters
                });

                setServices(res.services || res.data || []);
                setPagination(res.pagination);
                setError(null);
                return res;
            } catch (error) {
                console.error('Error fetching Services:', error);
                setError('Error al cargar los Services');
                openNotification('error', error.message || 'Error al cargar los Services');
                return error;
            } finally {
                setLoading(false);
            }
        }, 500) // espera 500ms antes de disparar la petición
    ).current;

    const fetchServices = useCallback(async () => {
        setLoading(true);
        debouncedFetchServices(filters);
    }, [filters, debouncedFetchServices]);

    const createService = async (data) => {
        console.log('createService data:', data);
        try {
            const res = await fetchClient({
                method: 'POST',
                endpoint: '/services',
                data
            });

            fetchServices();
            openNotification('success', 'Service created successfully');

            return true;
        } catch (error) {
            console.error('Error creating Service:', error);
            openNotification('error', error.message || 'Error creating Service');
            return error;
        }
    };

    const deleteService = async (id) => {
        const result = await Swal.fire({
            icon: 'warning',
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel',
            allowOutsideClick: false,
            padding: '2em',
            background: 'transparent',
            customClass: {
                container: 'z-[9999] liquid-glass-container',
                popup: 'liquid-glass rounded-2xl border border-white/20 shadow-2xl glow-border',
                title: 'text-white font-bold',
                htmlContainer: 'text-gray-200',
                confirmButton:
                    'bg-red-600/50 hover:bg-red-700/50 border border-red-500/30 text-white rounded-xl transition-all duration-300',
                cancelButton:
                    'bg-gray-600/50 hover:bg-gray-700/50 border border-gray-500/30 text-white rounded-xl transition-all duration-300'
            },
            didOpen: (popup) => {
                popup.querySelector('.swal2-icon')?.classList.add('scale-110');
            }
        });

        if (result.isConfirmed) {
            try {
                const res = await fetchClient({
                    method: 'DELETE',
                    endpoint: `/services/${id}`
                });

                fetchServices();
                openNotification('success', 'Service deleted successfully');
                return true;
            } catch (error) {
                console.error('Error deleting Service:', error);
                openNotification('error', error.message || 'Error deleting Service');
                return error;
            }
        }
    };

    const updateService = async (id, data) => {
        try {
            const res = await fetchClient({
                method: 'PUT',
                endpoint: `/services/${id}`,
                data
            });

            fetchServices();
            openNotification('success', 'Service updated successfully');
            return true;
        } catch (error) {
            console.error('Error updating Service:', error);
            openNotification('error', error.message || 'Error updating Service');
            return error;
        }
    };

    const getServiceById = useCallback(async (id) => {
        try {
            const res = await fetchClient({
                method: 'GET',
                endpoint: `/services/${id}`
            });

            console.log('getServiceById res:', res);
            setService(res);

            return res;
        } catch (error) {
            console.error('Error fetching Service:', error);
            openNotification('error', error.message || 'Error loading Service');
        }
    }, []);

    // Efecto para inicializar la carga de datos
    useEffect(() => {
        fetchServices();
    }, []); // Carga inicial al montar el hook

    return {
        handleChangeFilter,
        filters,
        services,
        pagination,
        loading,
        error,
        service,
        fetchServices,
        createService,
        deleteService,
        updateService,
        getServiceById,
    };
}