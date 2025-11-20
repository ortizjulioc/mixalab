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
import useDowngradeTriggers from '@/hooks/useDowngradeTriggers'
import useTiers from '@/hooks/useTiers'
import Table from '@/components/Table'
import BreadcrumbsTitle from '@/components/Breadcrumbs'

export default function DowngradeTriggersPage() {
  const { items, fetchItems, createItem, updateItem, deleteItem, filters, pagination, loading, handleChangeFilter } = useDowngradeTriggers()
  const { tiers, fetchTiers } = useTiers()

  const [openModal, setOpenModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)

  useEffect(() => {
    fetchItems()
    fetchTiers()
  }, [fetchItems, fetchTiers])

  const handleEdit = (it) => { setSelectedItem(it); setOpenModal(true) }

  const columns = [
    { key: 'tier', label: 'Tier', render: (t) => t?.name || '' },
    { key: 'minRatingThreshold', label: 'Min Rating Threshold' },
    { key: 'lateDeliveriesLimit', label: 'Late Deliveries Limit' },
  ]

  const tierOptions = tiers?.map((t) => ({ label: t.name, value: t.id })) || []

  return (
    <div className="space-y-8">
      <BreadcrumbsTitle title="Downgrade Triggers" items={[{ label: 'Dashboard', href: '/admin/home', icon: <Home size={18} /> }, { label: 'Downgrade Triggers' }]} />

      <div className="flex flex-col sm:flex-row items-center gap-4 p-6 border border-white/20 rounded-2xl liquid-glass w-full">
        <div className="flex-1 w-full">
          <Input type="text" placeholder="Search..." value={filters.search} onChange={(e) => handleChangeFilter('search', e.target.value)} className="w-full p-3 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/50" />
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

      <Modal open={openModal} onClose={() => setOpenModal(false)} title={selectedItem ? 'Edit Downgrade Trigger' : 'Create Downgrade Trigger'}>
        <Formik enableReinitialize initialValues={{ tierId: selectedItem?.tierId || '', minRatingThreshold: selectedItem?.minRatingThreshold ?? 0, lateDeliveriesLimit: selectedItem?.lateDeliveriesLimit ?? 0, unresolvedDisputesLimit: selectedItem?.unresolvedDisputesLimit ?? '', refundRateLimit: selectedItem?.refundRateLimit ?? '', inactivityDays: selectedItem?.inactivityDays ?? '' }}
          validationSchema={Yup.object({ tierId: Yup.string().required('Tier is required'), minRatingThreshold: Yup.number().min(0).required('minRatingThreshold required'), lateDeliveriesLimit: Yup.number().integer().min(0).required('lateDeliveriesLimit required') })}
          onSubmit={async (values, { resetForm }) => { if (selectedItem) await updateItem(selectedItem.id, values); else await createItem(values); resetForm(); setOpenModal(false); fetchItems(); }}>
          {({ values, handleChange, setFieldValue, touched, errors, isSubmitting }) => (
            <Form className="space-y-4">
              <Select label="Tier" name="tierId" options={tierOptions} value={values.tierId} onChange={(val) => setFieldValue('tierId', val)} error={touched.tierId && errors.tierId} />

              <Input label="Min Rating Threshold" name="minRatingThreshold" type="number" step="0.1" value={values.minRatingThreshold} onChange={(e) => setFieldValue('minRatingThreshold', Number(e.target.value))} error={touched.minRatingThreshold && errors.minRatingThreshold} />

              <Input label="Late Deliveries Limit" name="lateDeliveriesLimit" type="number" value={values.lateDeliveriesLimit} onChange={(e) => setFieldValue('lateDeliveriesLimit', Number(e.target.value))} error={touched.lateDeliveriesLimit && errors.lateDeliveriesLimit} />

              <Input label="Unresolved Disputes Limit" name="unresolvedDisputesLimit" type="number" value={values.unresolvedDisputesLimit} onChange={(e) => setFieldValue('unresolvedDisputesLimit', e.target.value === '' ? '' : Number(e.target.value))} error={touched.unresolvedDisputesLimit && errors.unresolvedDisputesLimit} />

              <Input label="Refund Rate Limit" name="refundRateLimit" type="number" step="0.01" value={values.refundRateLimit} onChange={(e) => setFieldValue('refundRateLimit', e.target.value === '' ? '' : Number(e.target.value))} error={touched.refundRateLimit && errors.refundRateLimit} />

              <Input label="Inactivity Days" name="inactivityDays" type="number" value={values.inactivityDays} onChange={(e) => setFieldValue('inactivityDays', e.target.value === '' ? '' : Number(e.target.value))} error={touched.inactivityDays && errors.inactivityDays} />

              <Button type="submit" color="blue" className="w-full" loading={isSubmitting}>{selectedItem ? 'Update' : 'Create'}</Button>
            </Form>
          )}
        </Formik>
      </Modal>
    </div>
  )
}
