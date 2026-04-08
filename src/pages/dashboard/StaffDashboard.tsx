import { useUser } from '@clerk/clerk-react'
import { useSearchParams } from 'react-router-dom'
import StaffPersonalSpace from '../../components/StaffPersonalSpace'
import StaffLayout from '../../components/dashboard/StaffLayout'

type TabId = 'oggi' | 'crm' | 'analytics' | 'lenormand' | 'astrologia'

export default function StaffDashboard() {
  const { user } = useUser()
  const [searchParams, setSearchParams] = useSearchParams()
  const tab = (searchParams.get('tab') as TabId) || 'oggi'

  const firstName = user?.firstName || 'Valeria'

  const handleTabChange = (newTab: string) => {
    setSearchParams({ tab: newTab })
  }

  return (
    <StaffLayout 
      title={`Ciao, ${firstName}`} 
      subtitle={`Staff Workspace / ${tab === 'oggi' ? 'Oggi' : tab.toUpperCase()}`}
      activeTab={tab}
      onTabChange={handleTabChange}
    >

        <StaffPersonalSpace activeTab={tab as any} />
    </StaffLayout>
  )
}

