'use client'

import React, { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { Formik, Form } from 'formik'
import * as Yup from 'yup'
import { Home } from 'lucide-react'
import dynamic from 'next/dynamic'

import Button from '@/components/Button'
import Input from '@/components/Input'
import Select from '@/components/Select'
import BreadcrumbsTitle from '@/components/Breadcrumbs'
import useTiers from '@/hooks/useTiers'

// Import React Quill dynamically to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false })
import 'react-quill-new/dist/quill.snow.css'
import '@/app/styles/quill-dark.css'

const TIER_OPTIONS = [
    { value: 'BRONZE', label: 'BRONZE' },
    { value: 'SILVER', label: 'SILVER' },
    { value: 'GOLD', label: 'GOLD' },
    { value: 'PLATINUM', label: 'PLATINUM' },
]

const validationSchema = Yup.object({
    name: Yup.string().required('Name is required'),
    order: Yup.number().integer('Must be integer').min(0, 'Must be >= 0').required('Order is required'),
    price: Yup.number().min(0, 'Price must be >= 0').required('Price is required'),
    numberOfRevisions: Yup.number().integer('Must be integer').min(0, 'Must be >= 0').required('Number of revisions is required'),
    stems: Yup.number().integer('Must be integer').min(0, 'Must be >= 0').required('Stems count is required'),
    deliveryDays: Yup.number().integer('Must be integer').min(1, 'Must be >= 1').required('Delivery days is required'),
})

export default function EditTierPage({ params }) {
    const { id } = use(params)
    const router = useRouter()
    const { fetchTierById, updateTier } = useTiers()
    const [tier, setTier] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadTier = async () => {
            try {
                const data = await fetchTierById(id)
                setTier(data)
            } catch (error) {
                console.error('Error loading tier:', error)
            } finally {
                setLoading(false)
            }
        }
        loadTier()
    }, [id, fetchTierById])

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        )
    }

    if (!tier) {
        return (
            <div className="text-center text-white">
                <p>Tier not found</p>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <BreadcrumbsTitle
                title="Edit Tier"
                items={[
                    { label: 'Dashboard', href: '/admin/home', icon: <Home size={18} /> },
                    { label: 'Tiers', href: '/admin/tiers' },
                    { label: 'Edit' },
                ]}
            />

            <div className="p-8 border border-white/20 rounded-2xl liquid-glass">
                <Formik
                    enableReinitialize
                    initialValues={{
                        name: tier?.name || '',
                        description: tier?.description || '',
                        order: tier?.order ?? 0,
                        price: tier?.price ?? 0,
                        numberOfRevisions: tier?.numberOfRevisions ?? 0,
                        stems: tier?.stems ?? 0,
                        deliveryDays: tier?.deliveryDays ?? 0,
                    }}
                    validationSchema={validationSchema}
                    onSubmit={async (values, { setSubmitting }) => {
                        try {
                            await updateTier(id, values)
                            router.push('/admin/tiers')
                        } catch (error) {
                            console.error('Error updating tier:', error)
                        } finally {
                            setSubmitting(false)
                        }
                    }}
                >
                    {({ values, handleChange, setFieldValue, touched, errors, isSubmitting }) => (
                        <Form className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Select
                                    label="Tier Name"
                                    id="name"
                                    options={TIER_OPTIONS}
                                    value={values.name}
                                    onChange={(value) => setFieldValue('name', value)}
                                    placeholder="Select tier"
                                    required
                                    error={touched.name && errors.name}
                                />

                                <Input
                                    label="Order"
                                    name="order"
                                    type="number"
                                    value={values.order}
                                    onChange={(e) => setFieldValue('order', Number(e.target.value))}
                                    error={touched.order && errors.order}
                                    required
                                />

                                <Input
                                    label="Price ($)"
                                    name="price"
                                    type="number"
                                    step="0.01"
                                    value={values.price}
                                    onChange={(e) => setFieldValue('price', Number(e.target.value))}
                                    error={touched.price && errors.price}
                                    required
                                />

                                <Input
                                    label="Number of Revisions"
                                    name="numberOfRevisions"
                                    type="number"
                                    value={values.numberOfRevisions}
                                    onChange={(e) => setFieldValue('numberOfRevisions', Number(e.target.value))}
                                    error={touched.numberOfRevisions && errors.numberOfRevisions}
                                    required
                                />

                                <Input
                                    label="Stems"
                                    name="stems"
                                    type="number"
                                    value={values.stems}
                                    onChange={(e) => setFieldValue('stems', Number(e.target.value))}
                                    error={touched.stems && errors.stems}
                                    required
                                />

                                <Input
                                    label="Delivery Days"
                                    name="deliveryDays"
                                    type="number"
                                    value={values.deliveryDays}
                                    onChange={(e) => setFieldValue('deliveryDays', Number(e.target.value))}
                                    error={touched.deliveryDays && errors.deliveryDays}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-white">
                                    Description <span className="text-red-500">*</span>
                                </label>
                                <div className="rounded-xl overflow-hidden border border-white/10">
                                    <ReactQuill
                                        theme="snow"
                                        value={values.description}
                                        onChange={(content) => setFieldValue('description', content)}
                                        placeholder="Enter tier description..."
                                        modules={{
                                            toolbar: [
                                                [{ header: [1, 2, 3, false] }],
                                                ['bold', 'italic', 'underline', 'strike'],
                                                [{ list: 'ordered' }, { list: 'bullet' }],
                                                ['link'],
                                                ['clean'],
                                            ],
                                        }}
                                    />
                                </div>
                                {touched.description && errors.description && (
                                    <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                                )}
                            </div>

                            <div className="flex gap-4 justify-end pt-4">
                                <Button
                                    type="button"
                                    color="gray"
                                    onClick={() => router.push('/admin/tiers')}
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" color="blue" loading={isSubmitting}>
                                    Update Tier
                                </Button>
                            </div>
                        </Form>
                    )}
                </Formik>
            </div>
        </div>
    )
}
