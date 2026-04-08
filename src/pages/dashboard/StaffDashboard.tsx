import { useState, useEffect } from 'react'
import { useUser } from '@clerk/clerk-react'
import { useSearchParams } from 'react-router-dom'
import StaffPersonalSpace from '../../components/StaffPersonalSpace'
import StaffLayout from '../../components/dashboard/StaffLayout'

type TabId = 'oggi' | 'crm' | 'analytics' | 'lenormand' | 'astrologia'

export default function StaffDashboard() {
  const { user } = useUser()
  const [searchParams] = useSearchParams()
  const [tab, setTab] = useState<TabId>((searchParams.get('tab') as TabId) || 'oggi')

  useEffect(() => {
    const t = searchParams.get('tab') as TabId
    if (t && t !== tab) {
      setTab(t)
    }
  }, [searchParams, tab])

  const firstName = user?.firstName || 'Valeria'

  return (
    <StaffLayout 
      title={`Ciao, ${firstName}`} 
      subtitle={`Staff Workspace / ${tab === 'oggi' ? 'Oggi' : tab.toUpperCase()}`}
      activeTab={tab}
      onTabChange={(t: string) => setTab(t as TabId)}
    >

        <StaffPersonalSpace activeTab={tab as any} />
    </StaffLayout>
  )
}

