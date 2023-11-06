'use client'

import { EmissionResults } from '~/components/EmissionResults'
import { EmissionsForm } from '~/components/EmissionsForm'
import { api } from '~/trpc/react'

export default function EmissionsWrap() {
  const { mutate, data, isLoading } = api.emissions.getEmissions.useMutation()

  return (
    <>
      <EmissionsForm mutate={mutate} isClicked={!!data} isLoading={isLoading} />

      {data && <EmissionResults data={data} />}
    </>
  )
}
