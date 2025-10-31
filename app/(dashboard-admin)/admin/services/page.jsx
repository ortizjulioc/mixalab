// app/Services/page.js
'use client';

import useServices from '@/hooks/useServices';
import React, { useState, useEffect } from 'react';
import { Edit, Home, Trash2 } from 'lucide-react';
import { Formik, Field, Form } from 'formik';
import * as yup from 'yup';
import Pagination from '@/components/Pagination';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Select from '@/components/Select';
import Breadcrumbs from '@/components/Breadcrumbs';

const serviceTypeOptions = [
    { value: '', label: 'All Types' },
    { value: 'MIXING', label: 'Mixing' },
    { value: 'MASTERING', label: 'Mastering' },
    { value: 'RECORDING', label: 'Recording' },
    { value: 'PRODUCTION', label: 'Production' },
    { value: 'ARRANGEMENT', label: 'Arrangement' },
    { value: 'OTHER', label: 'Other' },
];

const validationSchema = yup.object({
    name: yup
        .string()
        .required('Name is required')
        .min(1, 'Name must be at least 1 character')
        .max(100, 'Name must not exceed 100 characters'),
    serviceType: yup
        .string()
        .required('Service Type is required')
        .oneOf(['MIXING', 'MASTERING', 'RECORDING', 'PRODUCTION', 'ARRANGEMENT', 'OTHER'], 'Invalid service type'),
    description: yup
        .string()
        .max(500, 'Description must not exceed 500 characters'),
});

export default function ServicesPage() {
    const { services, loading, error, filters, handleChangeFilter, pagination, createService, updateService, deleteService, fetchServices } = useServices();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formLoading, setFormLoading] = useState(false);
    const [initialValues, setInitialValues] = useState({
        name: '',
        serviceType: '',
        description: '',
    });

    const openModal = (editId) => {
        if (editId) {
            setEditingId(editId);
            const serviceToEdit = services.find(s => s.id === editId);
            const values = {
                name: serviceToEdit ? serviceToEdit.name : '',
                serviceType: serviceToEdit ? serviceToEdit.serviceType : '',
                description: serviceToEdit ? (serviceToEdit.description || '') : '',
            };
            setInitialValues(values);
        } else {
            setEditingId(null);
            setInitialValues({
                name: '',
                serviceType: '',
                description: '',
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
        setInitialValues({
            name: '',
            serviceType: '',
            description: '',
        });
    };

    const handleSubmit = async (values, { setSubmitting, resetForm }) => {
        console.log('Submitting form with values:', values); // Debug log
        setFormLoading(true);
        try {
            const payload = {
                name: values.name.trim(),
                serviceType: values.serviceType,
                description: values.description.trim() || null,
            };
            console.log('Payload to API:', payload); // Debug log
            if (editingId) {
                await updateService(editingId, payload);
            } else {
                await createService(payload);
            }
            closeModal();
            resetForm();
            await fetchServices(); // Refresh list
        } catch (err) {
            console.error('Error saving service:', err);
            // Optionally, show error in modal or notification
        } finally {
            setFormLoading(false);
            setSubmitting(false);
        }
    };

    const handleEdit = (id) => openModal(id);

    const handleDelete = async (id) => {
        await deleteService(id); // Hook handles confirmation
        await fetchServices(); // Refresh
    };

    useEffect(() => {
        fetchServices()
    }, [fetchServices])

    if (error) {
        return (
            <div className="p-8 text-center liquid-glass rounded-2xl border border-white/20">
                <p className="text-red-400 mb-4">Error: {error}</p>
                <Button
                    onClick={fetchServices}
                    color="blue"
                    size="md"
                    className="px-4 py-2"
                >
                    Retry
                </Button>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-6 shadow-2xl">

            {/* Título con Breadcrumbs */}
            <Breadcrumbs
                title="Services"  // Título manual
                items={[
                    { label: 'Dashboard', href: '/admin/home', icon: <Home size={18} /> },
                    { label: 'Services' },  // Último sin href
                ]}
            />
            {/* Header with Search, Filter and New Button */}
            <div className="p-6 border border-white/20 rounded-2xl liquid-glass shadow-lg">
  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full">
    {/* Contenedor de búsqueda y filtro que ocupa todo el ancho */}
    <div className="flex flex-col sm:flex-row items-center gap-4 w-full flex-1">
      {/* Input: más ancho */}
      <div className="flex-[0.8] w-full">
        <Input
          type="text"
          placeholder="Search services..."
          value={filters.search}
          onChange={(e) => handleChangeFilter('search', e.target.value)}
          className="w-full p-3 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 transition-all duration-200"
        />
      </div>

      {/* Select: más corto */}
      <div className="flex-[0.2] w-full">
        <Select
          options={serviceTypeOptions}
          value={filters.serviceType}
          onChange={(value) => handleChangeFilter('serviceType', value)}
          placeholder="Filter by Type"
          className="w-full rounded-xl"
          isClearable
        />
      </div>
    </div>

    {/* Botón de nuevo servicio */}
    <Button
      onClick={() => openModal()}
      color="blue"
      size="lg"
      disabled={loading}
      className="px-8 py-3 rounded-xl font-semibold transition-all duration-200 hover:scale-105 shadow-md hover:shadow-blue-500/20 sm:ml-4 w-full sm:w-auto"
    >
      {loading ? 'Loading...' : 'New'}
    </Button>
  </div>
</div>


            {/* Table with Skeleton */}
            {loading ? (
                <div className="space-y-4 p-4 border border-white/20 rounded-2xl liquid-glass">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center p-4 space-x-4">
                            <div className="h-4 bg-white/10 rounded w-1/5 animate-pulse"></div>
                            <div className="h-4 bg-white/10 rounded w-1/5 animate-pulse"></div>
                            <div className="h-4 bg-white/10 rounded w-2/5 animate-pulse"></div>
                            <div className="h-4 bg-white/10 rounded w-1/5 animate-pulse"></div>
                            <div className="flex space-x-2 ml-auto">
                                <div className="h-8 bg-white/10 rounded w-16 animate-pulse"></div>
                                <div className="h-8 bg-white/10 rounded w-16 animate-pulse"></div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : services.length === 0 ? (
                <div className="p-8 text-center text-gray-400 liquid-glass rounded-2xl border border-white/20">
                    No Services found. Create one above!
                </div>
            ) : (
                <div className="overflow-x-auto border border-white/20 rounded-2xl liquid-glass">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-white/5">
                                <th className="p-4 text-left text-white font-semibold border-b border-white/20">Name</th>
                                <th className="p-4 text-left text-white font-semibold border-b border-white/20">Service Type</th>
                                <th className="p-4 text-left text-white font-semibold border-b border-white/20">Description</th>
                                <th className="p-4 text-left text-white font-semibold border-b border-white/20">Created At</th>
                                <th className="p-4 text-right text-white font-semibold border-b border-white/20">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {services.map((service) => (
                                <tr key={service.id} className="border-b border-white/10 hover:bg-white/5 transition">
                                    <td className="p-4 text-white">{service.name}</td>
                                    <td className="p-4 text-white capitalize">{service.serviceType?.replace(/_/g, ' ').toLowerCase()}</td>
                                    <td className="p-4 text-gray-400 max-w-md truncate" title={service.description || 'No description'}>{service.description || 'No description'}</td>
                                    <td className="p-4 text-gray-400">{new Date(service.createdAt).toLocaleDateString()}</td>
                                    <td className="p-4 text-right">
                                        <Button
                                            onClick={() => handleEdit(service.id)}
                                            color="blue"
                                            size="sm"
                                            className="mr-2 p-2 border-0 hover:scale-100"
                                            variant="secondary"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            onClick={() => handleDelete(service.id)}
                                            color="red"
                                            size="sm"
                                            className="p-2 border-0 hover:scale-100"
                                            variant="secondary"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {/* Pagination */}
                    <Pagination
                        pagination={{
                            page: pagination.currentPage || pagination.page,
                            pages: pagination.totalPages || pagination.pages,
                        }}
                        onPageChange={(newPage) => handleChangeFilter('page', newPage)}
                    />
                </div>
            )}

            {/* Inline Modal for Create/Edit */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-transparent liquid-glass rounded-2xl border border-white/20 p-6 w-full max-w-md shadow-2xl">
                        <h2 className="text-2xl font-bold mb-6 text-white">
                            {editingId ? 'Edit Service' : 'Create New Service'}
                        </h2>
                        <Formik
                            initialValues={initialValues}
                            validationSchema={validationSchema}
                            onSubmit={handleSubmit}
                            enableReinitialize={true}
                        >
                            {({ isSubmitting, errors, touched, setFieldValue }) => (
                                <Form className="space-y-4" noValidate>
                                    <Field name="name">
                                        {({ field, meta }) => (
                                            <Input
                                                label="Name"
                                                {...field}
                                                type="text"
                                                placeholder="Service name"
                                                required
                                                error={meta.touched && meta.error ? meta.error : undefined}
                                            />
                                        )}
                                    </Field>

                                    <Field name="serviceType">
                                        {({ field, meta, form }) => (
                                            <Select
                                                label="Service Type"
                                                options={serviceTypeOptions.filter(opt => opt.value !== '')}
                                                value={field.value}
                                                onChange={(value) => form.setFieldValue(field.name, value)}
                                                onBlur={field.onBlur}
                                                required
                                                placeholder="Select a service type"
                                                error={meta.touched && meta.error ? meta.error : undefined}
                                            />
                                        )}
                                    </Field>

                                    <Field name="description">
                                        {({ field, meta }) => (
                                            <Input
                                                label="Description"
                                                {...field}
                                                as="textarea"
                                                placeholder="Enter description..."
                                                rows={3}
                                                error={meta.touched && meta.error ? meta.error : undefined}
                                            />
                                        )}
                                    </Field>

                                    <div className="flex justify-end space-x-3">
                                        <Button
                                            type="button"
                                            onClick={closeModal}
                                            color="gray"
                                            size="md"
                                            className="px-6"
                                            variant="secondary"
                                            disabled={isSubmitting}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            color="blue"
                                            size="md"
                                            loading={formLoading || isSubmitting}
                                            disabled={formLoading || isSubmitting}
                                            className="px-6 flex-0"
                                        >
                                            {editingId ? 'Update' : 'Create'}
                                        </Button>
                                    </div>
                                </Form>
                            )}
                        </Formik>
                    </div>
                </div>
            )}
        </div>
    );
}