'use client'

import React, { useEffect, useState } from 'react'
import { Edit, Trash2, KeyRound, Home } from 'lucide-react'
import { Formik, Form } from 'formik'
import * as Yup from 'yup'

import Button from '@/components/Button'
import Input from '@/components/Input'
import Select from '@/components/Select'
import Modal from '@/components/Modal'
import Pagination from '@/components/Pagination'
import useUsers from '@/hooks/useUsers'
import Table from '@/components/Table' // ✅ nuevo componente reutilizable
import BreadcrumbsTitle from '@/components/Breadcrumbs'

// ✅ Role Badge Component
const RoleBadge = ({ role }) => {
  const getRoleStyles = (role) => {
    switch (role?.toUpperCase()) {
      case 'ARTIST':
        return 'liquid-glass border border-blue-500/30 text-blue-200 px-2 py-1 rounded-full text-xs font-semibold ml-2 glow-border'
      case 'CREATOR':
        return 'liquid-glass border border-green-500/30 text-green-200 px-2 py-1 rounded-full text-xs font-semibold ml-2 glow-border'
      case 'ADMIN':
        return 'liquid-glass border border-red-500/30 text-red-200 px-2 py-1 rounded-full text-xs font-semibold ml-2 glow-border'
      case 'SUPER_ADMIN':
        return 'liquid-glass border border-purple-500/30 text-purple-200 px-2 py-1 rounded-full text-xs font-semibold ml-2 glow-border'
      default:
        return 'liquid-glass border border-gray-500/30 text-gray-200 px-2 py-1 rounded-full text-xs font-semibold ml-2 glow-border'
    }
  }
  return <span className={getRoleStyles(role)}>{role}</span>
}

export default function UsersPage() {
  const {
    users,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    changePassword,
    filters,
    pagination,
    loading,
    handleChangeFilter,
  } = useUsers()

  const [openModalUser, setOpenModalUser] = useState(false)
  const [openModalPassword, setOpenModalPassword] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [rowLoading, setRowLoading] = useState({})

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const roles = [
    { label: 'Artist', value: 'ARTIST' },
    { label: 'Creator', value: 'CREATOR' },
    { label: 'Admin', value: 'ADMIN' },
    { label: 'Super Admin', value: 'SUPER_ADMIN' },
  ]

  const validationSchema = Yup.object({
    name: Yup.string().required('Name is required'),
    email: Yup.string().email('Invalid email').required('Email is required'),
    role: Yup.string().required('Role is required'),
  })

  const passwordSchema = Yup.object({
    newPassword: Yup.string().min(6, 'At least 6 characters').required('Required'),
    repeatPassword: Yup.string()
      .oneOf([Yup.ref('newPassword'), null], 'Passwords must match')
      .required('Required'),
  })

  const handleEdit = (user) => {
    setSelectedUser(user)
    setOpenModalUser(true)
  }



  const handlePasswordChange = (user) => {
    setSelectedUser(user)
    setOpenModalPassword(true)
  }

  // ✅ Columnas de la tabla
  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    {
      key: 'role',
      label: 'Role',
      render: (value) => <RoleBadge role={value} />,
    },
    {
      key: 'createdAt',
      label: 'Created At',
      render: (value) => new Date(value).toLocaleDateString(),
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <BreadcrumbsTitle
        title="Users"
        items={[
          { label: 'Dashboard', href: '/admin/home', icon: <Home size={18} /> },
          { label: 'Users' },
        ]}
      />
      {/* Header with Search and New Button */}
      <div className="flex flex-col sm:flex-row items-center gap-4 p-6 border border-white/20 rounded-2xl liquid-glass w-full">
        <div className="flex-1 w-full">
          <Input
            type="text"
            placeholder="Search users..."
            value={filters.search}
            onChange={(e) => handleChangeFilter('search', e.target.value)}
            className="w-full p-3 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/50"
          />
        </div>

        <div className="flex-none">
          <Button
            onClick={() => setOpenModalUser(true)}
            color="blue"
            size="lg"
            loading={loading}
            className="px-8"
          >
            New
          </Button>
        </div>
      </div>


      {/* Users Table */}

      <Table
        columns={columns}
        loading={loading}
        data={users}
        renderActions={(user) => (
          <div className="flex justify-end">
            <Button
              onClick={() => handlePasswordChange(user)}
              color="purple"
              size="sm"
              className="mr-2 p-2 border-0 hover:scale-100"
              variant="secondary"
            >
              <KeyRound className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => handleEdit(user)}
              color="blue"
              size="sm"
              className="mr-2 p-2 border-0 hover:scale-100"
              variant="secondary"
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              onClick={ () => deleteUser(user.id)}
              color="red"
              size="sm"
              className="p-2 border-0 hover:scale-100"
              variant="secondary"
              loading={rowLoading[user.id]}
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

      {/* Modal Create/Edit User */}
      <Modal
        open={openModalUser}
        onClose={() => setOpenModalUser(false)}
        title={selectedUser ? 'Edit User' : 'Create User'}
      >
        <Formik
          initialValues={{
            name: selectedUser?.name || '',
            email: selectedUser?.email || '',
            role: selectedUser?.role || '',
            password: '',
            repeatPassword: '',
          }}
          validationSchema={Yup.object({
            name: Yup.string().required('Name is required'),
            email: Yup.string().email('Invalid email').required('Email is required'),
            role: Yup.string().required('Role is required'),
            ...(selectedUser
              ? {} // si es edición → NO validar password
              : {
                password: Yup.string()
                  .min(6, 'At least 6 characters')
                  .required('Password is required'),
                repeatPassword: Yup.string()
                  .oneOf([Yup.ref('password'), null], 'Passwords must match')
                  .required('Repeat the password'),
              }),
          })}
          onSubmit={async (values, { resetForm }) => {
            if (selectedUser) {
              // EDITAR
              await updateUser(selectedUser.id, {
                name: values.name,
                role: values.role,
              })
            } else {
              // CREAR NUEVO USUARIO
              await createUser({
                name: values.name,
                email: values.email,
                role: values.role,
                password: values.password,
              })
            }

            resetForm()
            setOpenModalUser(false)
            fetchUsers()
          }}
        >
          {({ values, handleChange, setFieldValue, touched, errors, isSubmitting }) => (
            <Form className="space-y-4">
              <Input
                label="Name"
                name="name"
                value={values.name}
                onChange={handleChange}
                error={touched.name && errors.name}
              />

              <Input
                label="Email"
                name="email"
                value={values.email}
                onChange={handleChange}
                error={touched.email && errors.email}
                disabled={!!selectedUser}
              />

              <Select
                label="Role"
                name="role"
                options={roles}
                value={values.role}
                onChange={(val) => setFieldValue('role', val)}
                error={touched.role && errors.role}
              />

              {/* CAMPOS DE PASSWORD SOLO SI ES NUEVO USUARIO */}
              {!selectedUser && (
                <>
                  <Input
                    label="Password"
                    name="password"
                    type="password"
                    value={values.password}
                    onChange={handleChange}
                    error={touched.password && errors.password}
                  />

                  <Input
                    label="Repeat Password"
                    name="repeatPassword"
                    type="password"
                    value={values.repeatPassword}
                    onChange={handleChange}
                    error={touched.repeatPassword && errors.repeatPassword}
                  />
                </>
              )}

              <Button type="submit" color="blue" className="w-full" loading={isSubmitting}>
                {selectedUser ? 'Update User' : 'Create User'}
              </Button>
            </Form>
          )}
        </Formik>
      </Modal>

      {/* Modal Change Password */}
      <Modal
        open={openModalPassword}
        onClose={() => setOpenModalPassword(false)}
        title={`Change Password for ${selectedUser?.name || ''}`}
      >
        <Formik
          initialValues={{ newPassword: '', repeatPassword: '' }}
          validationSchema={passwordSchema}
          onSubmit={async (values, { resetForm }) => {
            await changePassword(
              selectedUser.id,
              values.newPassword,
              values.repeatPassword
            )
            resetForm()
            setOpenModalPassword(false)
          }}
        >
          {({ values, handleChange, errors, touched, isSubmitting }) => (
            <Form className="space-y-4">
              <Input
                label="New Password"
                name="newPassword"
                type="password"
                value={values.newPassword}
                onChange={handleChange}
                error={touched.newPassword && errors.newPassword}
              />
              <Input
                label="Repeat Password"
                name="repeatPassword"
                type="password"
                value={values.repeatPassword}
                onChange={handleChange}
                error={touched.repeatPassword && errors.repeatPassword}
              />
              <Button type="submit" color="purple" className="w-full" loading={isSubmitting}>
                Change Password
              </Button>
            </Form>
          )}
        </Formik>
      </Modal>
    </div>
  )
}
