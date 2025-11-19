'use client'

import React, { useEffect, useState } from 'react'
import { Edit, Trash2, Home } from 'lucide-react'
import { Formik, Form } from 'formik'
import * as Yup from 'yup'

import Button from '@/components/Button'
import Input from '@/components/Input'
import Select from '@/components/Select'
import Modal from '@/components/Modal'
import Pagination from '@/components/Pagination'
import useUpgradeRequirements from '@/hooks/useUpgradeRequirements'
import useTiers from '@/hooks/useTiers'
import Table from '@/components/Table'
import BreadcrumbsTitle from '@/components/Breadcrumbs'

export default function UpgradeRequirementsPage() {
  const {
    items,
    fetchItems,
    createItem,
    updateItem,
    deleteItem,
    filters,
    pagination,
    loading,
    handleChangeFilter,
  } = useUpgradeRequirements()

  const { tiers, fetchTiers } = useTiers()

  const [openModal, setOpenModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)

  useEffect(() => {
    fetchItems()
    fetchTiers()
  }, [fetchItems, fetchTiers])

  const handleEdit = (it) => {
    setSelectedItem(it)
    setOpenModal(true)
  }

  const columns = [
    { key: 'tier', label: 'Tier', render: (t) => t?.name || '' },
    { key: 'minProjects', label: 'Min Projects' },
    { key: 'minRating', label: 'Min Rating' },
    { key: 'minOnTimeRate', label: 'Min OnTime Rate' },
  ]

  const tierOptions = tiers?.map((t) => ({ label: t.name, value: t.id })) || []

  return (
    <div className="space-y-8">
      <BreadcrumbsTitle
        title="Upgrade Requirements"
        items={[{ label: 'Dashboard', href: '/admin/home', icon: <Home size={18} /> }, { label: 'Upgrade Requirements' }]}
      />

      <div className="flex flex-col sm:flex-row items-center gap-4 p-6 border border-white/20 rounded-2xl liquid-glass w-full">
        <div className="flex-1 w-full">
          <Input
            type="text"
            placeholder="Search..."
            value={filters.search}
            onChange={(e) => handleChangeFilter('search', e.target.value)}
            className="w-full p-3 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/50"
          />
        </div>

        <div className="flex-none">
          <Button onClick={() => { setSelectedItem(null); setOpenModal(true) }} color="blue" size="lg" loading={loading} className="px-8">New</Button>
        </div>
      </div>

      <Table columns={columns} loading={loading} data={items} renderActions={(it) => (
        <div className="flex justify-end">
          <Button onClick={() => handleEdit(it)} color="blue" size="sm" className="mr-2 p-2 border-0 hover:scale-100" variant="secondary"><Edit className="w-4 h-4" /></Button>
          <Button onClick={() => deleteItem(it.id)} color="red" size="sm" className="p-2 border-0 hover:scale-100" variant="secondary"><Trash2 className="w-4 h-4" /></Button>
        </div>
      )} />

      <Pagination pagination={pagination} onPageChange={(page) => handleChangeFilter('page', page)} />

      <Modal open={openModal} onClose={() => setOpenModal(false)} title={selectedItem ? 'Edit Upgrade Requirement' : 'Create Upgrade Requirement'}>
        <Formik enableReinitialize initialValues={{ tierId: selectedItem?.tierId || '', minProjects: selectedItem?.minProjects ?? 0, minRating: selectedItem?.minRating ?? 0, minOnTimeRate: selectedItem?.minOnTimeRate ?? 0, minReturningClients: selectedItem?.minReturningClients ?? '', minFeedbackScore: selectedItem?.minFeedbackScore ?? '' }}
          validationSchema={Yup.object({ tierId: Yup.string().required('Tier is required'), minProjects: Yup.number().integer().min(0).required('minProjects required'), minRating: Yup.number().min(0).required('minRating required'), minOnTimeRate: Yup.number().min(0).max(1).required('minOnTimeRate required') })}
          onSubmit={async (values, { resetForm }) => {
            if (selectedItem) await updateItem(selectedItem.id, values)
            else await createItem(values)
            resetForm()
            setOpenModal(false)
            fetchItems()
          }}>
          {({ values, handleChange, setFieldValue, touched, errors, isSubmitting }) => (
            <Form className="space-y-4">
              <Select label="Tier" name="tierId" options={tierOptions} value={values.tierId} onChange={(val) => setFieldValue('tierId', val)} error={touched.tierId && errors.tierId} />

              <Input label="Min Projects" name="minProjects" type="number" value={values.minProjects} onChange={(e) => setFieldValue('minProjects', Number(e.target.value))} error={touched.minProjects && errors.minProjects} />

              <Input label="Min Rating" name="minRating" type="number" step="0.1" value={values.minRating} onChange={(e) => setFieldValue('minRating', Number(e.target.value))} error={touched.minRating && errors.minRating} />

              <Input label="Min On Time Rate" name="minOnTimeRate" type="number" step="0.01" value={values.minOnTimeRate} onChange={(e) => setFieldValue('minOnTimeRate', Number(e.target.value))} error={touched.minOnTimeRate && errors.minOnTimeRate} />

              <Input label="Min Returning Clients" name="minReturningClients" type="number" value={values.minReturningClients} onChange={(e) => setFieldValue('minReturningClients', e.target.value === '' ? '' : Number(e.target.value))} error={touched.minReturningClients && errors.minReturningClients} />

              <Input label="Min Feedback Score" name="minFeedbackScore" type="number" step="0.1" value={values.minFeedbackScore} onChange={(e) => setFieldValue('minFeedbackScore', e.target.value === '' ? '' : Number(e.target.value))} error={touched.minFeedbackScore && errors.minFeedbackScore} />

              <Button type="submit" color="blue" className="w-full" loading={isSubmitting}>{selectedItem ? 'Update' : 'Create'}</Button>
            </Form>
          )}
        </Formik>
      </Modal>
    </div>
  )
}
