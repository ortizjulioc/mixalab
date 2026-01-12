'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Formik, Form } from 'formik'
import * as Yup from 'yup'
import { Home, Plus, Trash2 } from 'lucide-react'

import Button from '@/components/Button'
import Input from '@/components/Input'
import Select from '@/components/Select'
import BreadcrumbsTitle from '@/components/Breadcrumbs'
import EmojiSelect from '@/components/EmojiSelect'
import useTiers from '@/hooks/useTiers'

const TIER_OPTIONS = [
    { value: 'BRONZE', label: 'BRONZE' },
    { value: 'SILVER', label: 'SILVER' },
    { value: 'GOLD', label: 'GOLD' },
    { value: 'PLATINUM', label: 'PLATINUM' },
]

const SERVICE_TYPES = ['MIXING', 'MASTERING', 'RECORDING']

const validationSchema = Yup.object({
    name: Yup.string().required('Name is required'),
    order: Yup.number().integer('Must be integer').min(0, 'Must be >= 0').required('Order is required'),
    price: Yup.number().min(0, 'Price must be >= 0').required('Price is required'),
    numberOfRevisions: Yup.number().integer('Must be integer').min(0, 'Must be >= 0').required('Number of revisions is required'),
    stems: Yup.number().integer('Must be integer').nullable(),
    deliveryDays: Yup.number().integer('Must be integer').min(1, 'Must be >= 1').required('Delivery days is required'),
})

export default function CreateTierPage() {
    const router = useRouter()
    const { createTier } = useTiers()
    const [activeServiceTab, setActiveServiceTab] = useState('MIXING')

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
                        order: 0,
                        price: 0,
                        numberOfRevisions: 0,
                        stems: null,
                        deliveryDays: 0,
                        serviceDescriptions: {
                            MIXING: { title: '', subtitle: '', description: '', features: [] },
                            MASTERING: { title: '', subtitle: '', description: '', features: [] },
                            RECORDING: { title: '', subtitle: '', description: '', features: [] },
                        }
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
                    {({ values, setFieldValue, touched, errors, isSubmitting }) => (
                        <Form className="space-y-6">
                            {/* Common Fields */}
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
                                    label="Stems (leave empty for mastering)"
                                    name="stems"
                                    type="number"
                                    value={values.stems ?? ''}
                                    onChange={(e) => setFieldValue('stems', e.target.value === '' ? null : Number(e.target.value))}
                                    error={touched.stems && errors.stems}
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

                            {/* Service-Specific Descriptions */}
                            <div className="pt-6 border-t border-white/10">
                                <h3 className="text-lg font-bold text-white mb-4">Service-Specific Descriptions</h3>

                                {/* Service Tabs */}
                                <div className="flex gap-2 mb-6">
                                    {SERVICE_TYPES.map(service => (
                                        <button
                                            key={service}
                                            type="button"
                                            onClick={() => setActiveServiceTab(service)}
                                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeServiceTab === service
                                                ? 'bg-amber-500 text-black'
                                                : 'bg-zinc-800 text-gray-400 hover:bg-zinc-700'
                                                }`}
                                        >
                                            {service}
                                        </button>
                                    ))}
                                </div>

                                {/* Service Description Form */}
                                <div className="space-y-4 p-6 bg-zinc-900/50 rounded-xl border border-white/5">
                                    <Input
                                        label="Title"
                                        value={values.serviceDescriptions[activeServiceTab]?.title || ''}
                                        onChange={(e) => setFieldValue(`serviceDescriptions.${activeServiceTab}.title`, e.target.value)}
                                        placeholder="e.g., The Essential Pro Start"
                                    />

                                    <Input
                                        label="Subtitle"
                                        value={values.serviceDescriptions[activeServiceTab]?.subtitle || ''}
                                        onChange={(e) => setFieldValue(`serviceDescriptions.${activeServiceTab}.subtitle`, e.target.value)}
                                        placeholder="e.g., Everything you need to begin at a professional level."
                                    />

                                    <div>
                                        <label className="block text-sm font-medium text-white mb-2">Description</label>
                                        <textarea
                                            value={values.serviceDescriptions[activeServiceTab]?.description || ''}
                                            onChange={(e) => setFieldValue(`serviceDescriptions.${activeServiceTab}.description`, e.target.value)}
                                            className="w-full p-3 rounded-xl bg-zinc-800 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-amber-500"
                                            rows={3}
                                            placeholder="Enter description..."
                                        />
                                    </div>

                                    {/* Features */}
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <label className="block text-sm font-medium text-white">Features</label>
                                            <Button
                                                type="button"
                                                size="sm"
                                                color="blue"
                                                onClick={() => {
                                                    const features = values.serviceDescriptions[activeServiceTab]?.features || []
                                                    setFieldValue(`serviceDescriptions.${activeServiceTab}.features`, [
                                                        ...features,
                                                        { icon: '✓', title: '', desc: '' }
                                                    ])
                                                }}
                                            >
                                                <Plus size={16} /> Add Feature
                                            </Button>
                                        </div>

                                        <div className="space-y-3">
                                            {(values.serviceDescriptions[activeServiceTab]?.features || []).map((feature, idx) => (
                                                <div key={idx} className="p-4 bg-zinc-800/50 rounded-lg border border-white/5 space-y-3">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <EmojiSelect
                                                            label="Icon"
                                                            value={feature.icon}
                                                            onChange={(emoji) => setFieldValue(`serviceDescriptions.${activeServiceTab}.features.${idx}.icon`, emoji)}
                                                        />
                                                        <div className="flex items-end gap-2">
                                                            <Input
                                                                label="Title"
                                                                value={feature.title}
                                                                onChange={(e) => setFieldValue(`serviceDescriptions.${activeServiceTab}.features.${idx}.title`, e.target.value)}
                                                                placeholder="Feature title"
                                                                className="flex-1"
                                                            />
                                                            <Button
                                                                type="button"
                                                                size="sm"
                                                                color="red"
                                                                onClick={() => {
                                                                    const features = values.serviceDescriptions[activeServiceTab]?.features || []
                                                                    setFieldValue(`serviceDescriptions.${activeServiceTab}.features`, features.filter((_, i) => i !== idx))
                                                                }}
                                                            >
                                                                <Trash2 size={16} />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                    <textarea
                                                        value={feature.desc}
                                                        onChange={(e) => setFieldValue(`serviceDescriptions.${activeServiceTab}.features.${idx}.desc`, e.target.value)}
                                                        className="w-full p-2 rounded-lg bg-zinc-900 border border-white/5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-amber-500"
                                                        rows={2}
                                                        placeholder="Feature description"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
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
