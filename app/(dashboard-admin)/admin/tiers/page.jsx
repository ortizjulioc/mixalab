'use client'

import React, { useEffect, useState } from 'react'
import { Edit, Trash2, Home } from 'lucide-react'
import { Formik, Form } from 'formik'
import * as Yup from 'yup'

import Button from '@/components/Button'
import Input from '@/components/Input'
import Modal from '@/components/Modal'
import Pagination from '@/components/Pagination'
import useTiers from '@/hooks/useTiers'
import Table from '@/components/Table'
import BreadcrumbsTitle from '@/components/Breadcrumbs'
import Select from '@/components/Select'


const TIER_OPTIONS = [
  { value: "BRONZE", label: "BRONZE" },
  { value: "SILVER", label: "SILVER" },
  { value: "GOLD", label: "GOLD" },
  { value: "PLATINUM", label: "PLATINUM" },
];


export default function TiersPage() {
  const {
    tiers,
    fetchTiers,
    createTier,
    updateTier,
    deleteTier,
    filters,
    pagination,
    loading,
    handleChangeFilter,
  } = useTiers()

  const [openModal, setOpenModal] = useState(false)
  const [selectedTier, setSelectedTier] = useState(null)

  useEffect(() => {
    fetchTiers()
  }, [fetchTiers])

  const handleEdit = (tier) => {
    setSelectedTier(tier)
    setOpenModal(true)
  }

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'description', label: 'Description' },
    { key: 'order', label: 'Order' },
    {
      key: 'createdAt',
      label: 'Created At',
      render: (value) => (value ? new Date(value).toLocaleDateString() : ''),
    },
  ]

  return (
    <div className="space-y-8">
      <BreadcrumbsTitle
        title="Tiers"
        items={[
          { label: 'Dashboard', href: '/admin/home', icon: <Home size={18} /> },
          { label: 'Tiers' },
        ]}
      />

      <div className="flex flex-col sm:flex-row items-center gap-4 p-6 border border-white/20 rounded-2xl liquid-glass w-full">
        <div className="flex-1 w-full">
          <Input
            type="text"
            placeholder="Search tiers..."
            value={filters.search}
            onChange={(e) => handleChangeFilter('search', e.target.value)}
            className="w-full p-3 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/50"
          />
        </div>

        <div className="flex-none">
          <Button
            onClick={() => { setSelectedTier(null); setOpenModal(true) }}
            color="blue"
            size="lg"
            loading={loading}
            className="px-8"
          >
            New
          </Button>
        </div>
      </div>

      <Table
        columns={columns}
        loading={loading}
        data={tiers}
        renderActions={(tier) => (
          <div className="flex justify-end">
            <Button
              onClick={() => handleEdit(tier)}
              color="blue"
              size="sm"
              className="mr-2 p-2 border-0 hover:scale-100"
              variant="secondary"
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => deleteTier(tier.id)}
              color="red"
              size="sm"
              className="p-2 border-0 hover:scale-100"
              variant="secondary"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        )}
      />

      <Pagination
        pagination={pagination}
        onPageChange={(page) => handleChangeFilter('page', page)}
      />

      <Modal
        open={openModal}
        onClose={() => setOpenModal(false)}
        title={selectedTier ? 'Edit Tier' : 'Create Tier'}
      >
        <Formik
          enableReinitialize
          initialValues={{
            name: selectedTier?.name || '',
            description: selectedTier?.description || '',
            order: selectedTier?.order ?? 0,
          }}
          validationSchema={Yup.object({
            name: Yup.string().required('Name is required'),
            order: Yup.number().integer('Must be integer').min(0, 'Must be >= 0').required('Order is required'),
          })}
          onSubmit={async (values, { resetForm }) => {
            if (selectedTier) {
              await updateTier(selectedTier.id, values)
            } else {
              await createTier(values)
            }
            resetForm()
            setOpenModal(false)
            fetchTiers()
          }}
        >
          {({ values, handleChange, setFieldValue, touched, errors, isSubmitting }) => (
            <Form className="space-y-4">
              <Select
                label="Tier"
                id="tier"
                options={TIER_OPTIONS}
                value={values.name}
                onChange={(value) => setFieldValue("name", value)}
                placeholder="Select tier"
                required
              />

              <Input
                label="Description"
                name="description"
                value={values.description}
                onChange={handleChange}
                error={touched.description && errors.description}
              />

              <Input
                label="Order"
                name="order"
                type="number"
                value={values.order}
                onChange={(e) => setFieldValue('order', Number(e.target.value))}
                error={touched.order && errors.order}
              />

              <Button type="submit" color="blue" className="w-full" loading={isSubmitting}>
                {selectedTier ? 'Update Tier' : 'Create Tier'}
              </Button>
            </Form>
          )}
        </Formik>
      </Modal>
    </div>
  )
}
