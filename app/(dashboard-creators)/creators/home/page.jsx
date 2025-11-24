'use client'
import CreatorSecurityPass from '@/components/CreatorSecurityPass'
import useCreatorProfile from '@/hooks/useCreatorProfile'
import { useSession } from 'next-auth/react'
import React, { useEffect } from 'react'

export default function Home() {
  const { data: session, status } = useSession();
  const { creatorProfile, getCreatorProfileByUserId, loading } = useCreatorProfile();

  useEffect(() => {
    // Only fetch if we have a user ID from the session
    if (session?.user?.id) {
      getCreatorProfileByUserId(session.user.id);
    }
  }, [session?.user?.id, getCreatorProfileByUserId]);

  return (
    <div>
      <CreatorSecurityPass
        creatorProfile={creatorProfile}
        loading={loading || status === 'loading'}
      />

      {/* Rest of your home page content */}
      <div className="px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-white mb-6">Creator Dashboard</h1>
        {/* Add your dashboard content here */}
      </div>
    </div>
  )
}
