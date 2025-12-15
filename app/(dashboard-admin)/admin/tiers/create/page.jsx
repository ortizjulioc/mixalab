'use client'

import React from 'react'
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

export default function CreateTierPage() {
    const router = useRouter()
    const { createTier } = useTiers()

    return (
        <div className="space-y-8">
            <BreadcrumbsTitle
                title="Create Tier"
                items={[
                    { label: 'Dashboard', href: '/admin/home', icon: <Home size={18} /> },
                    { label: 'Tiers', href: '/admin/tiers' },
                    { label: 'Create' },
                ]}
            />

            <div className="p-8 border border-white/20 rounded-2xl liquid-glass">
                <Formik
                    initialValues={{
                        name: '',
                        description: '',
                        order: 0,
                        price: 0,
                        numberOfRevisions: 0,
                        stems: 0,
                        deliveryDays: 0,
                    }}
                    validationSchema={validationSchema}
                    onSubmit={async (values, { setSubmitting }) => {
                        try {
                            await createTier(values)
                            router.push('/admin/tiers')
                        } catch (error) {
                            console.error('Error creating tier:', error)
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
                                    Create Tier
                                </Button>
                            </div>
                        </Form>
                    )}
                </Formik>
            </div>
        </div>
    )
}
