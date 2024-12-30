"use client"
import React from 'react'
import { logout } from '@/app/actions/auth-actions'

const LogoutBtn = () => {
  const handleLogout = async () => {
    await logout()
  }

  return (
    <span onClick={() => handleLogout()} className='inline-block w-full cursor-pointer text-destructive'>Log out</span>
  )
}

export default LogoutBtn