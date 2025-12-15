'use client'

import React, { useEffect } from 'react'
import { Edit, Trash2, Home, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'

import Button from '@/components/Button'
import Input from '@/components/Input'
import Pagination from '@/components/Pagination'
import useTiers from '@/hooks/useTiers'
import Table from '@/components/Table'
import BreadcrumbsTitle from '@/components/Breadcrumbs'

export default function TiersPage() {
  const router = useRouter()
  const {
    tiers,
    fetchTiers,
    deleteTier,
    filters,
    pagination,
    loading,
    handleChangeFilter,
  } = useTiers()

  useEffect(() => {
    fetchTiers()
  }, [fetchTiers])

  const columns = [
    { key: 'name', label: 'Name' },
    {
      key: 'description',
      label: 'Description',
      render: (value) => {
        if (!value) return '-'
        // Strip HTML tags for table display
        const stripped = value.replace(/<[^>]*>/g, '')
        return stripped.length > 50 ? stripped.substring(0, 50) + '...' : stripped
      }
    },
    { key: 'order', label: 'Order' },
    {
      key: 'price',
      label: 'Price',
      render: (value) => `$${value?.toFixed(2) || '0.00'}`
    },
    {
      key: 'numberOfRevisions',
      label: 'Revisions',
      render: (value) => value ?? 0
    },
    {
      key: 'stems',
      label: 'Stems',
      render: (value) => value ?? 0
    },
    {
      key: 'deliveryDays',
      label: 'Delivery',
      render: (value) => `${value ?? 0} days`
    },
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
            onClick={() => router.push('/admin/tiers/create')}
            color="blue"
            size="lg"
            loading={loading}
            className="px-8 flex items-center gap-2"
          >
            <Plus size={20} />
            New Tier
          </Button>
        </div>
      </div>

      <Table
        columns={columns}
        loading={loading}
        data={tiers}
        renderActions={(tier) => (
          <div className="flex justify-end gap-2">
            <Button
              onClick={() => router.push(`/admin/tiers/${tier.id}/edit`)}
              color="blue"
              size="sm"
              className="p-2 border-0 hover:scale-100"
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
    </div>
  )
}
