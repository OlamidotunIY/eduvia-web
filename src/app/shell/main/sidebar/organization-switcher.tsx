import { useEffect, useState } from 'react'
import { Building2 } from 'lucide-react'
import { useSwitchOrganizationMutation } from '@/features/organization'
import { sessionStore } from '@/shared/store'

export function OrganizationSwitcher() {
  const currentUser = sessionStore((state) => state.currentUser)
  const switchOrganization = useSwitchOrganizationMutation()
  const [requestedOrganizationId, setRequestedOrganizationId] = useState<string | null>(null)

  useEffect(() => {
    if (requestedOrganizationId === currentUser?.activeOrganization?.id) {
      setRequestedOrganizationId(null)
    }
  }, [currentUser?.activeOrganization?.id, requestedOrganizationId])

  if (!currentUser?.organizations.length) return null

  const isSwitching = switchOrganization.isPending || Boolean(requestedOrganizationId)
  return (
    <label className="mb-5 block">
      <span className="mb-1.5 flex items-center gap-2 px-1 text-xs font-medium text-muted-foreground"><Building2 className="size-3.5" />Organization</span>
      <select
        className="h-9 w-full rounded-md border bg-background px-2 text-sm"
        value={currentUser.activeOrganization?.id ?? ''}
        disabled={isSwitching}
        onChange={(event) => {
          const organizationId = event.target.value
          if (!organizationId || organizationId === currentUser.activeOrganization?.id) return
          switchOrganization.mutate(organizationId, {
            onSuccess: () => setRequestedOrganizationId(organizationId),
          })
        }}
      >
        {currentUser.organizations.map((organization) => <option key={organization.id} value={organization.id}>{organization.name}</option>)}
      </select>
      {isSwitching && <span className="mt-1 block px-1 text-xs text-muted-foreground">Switching workspace…</span>}
    </label>
  )
}
