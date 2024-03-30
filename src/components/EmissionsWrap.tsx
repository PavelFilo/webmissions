'use client'

import { EmissionResults } from '~/components/EmissionResults'
import { EmissionsForm } from '~/components/EmissionsForm'
import { api } from '~/trpc/react'

import Hotjar from '@hotjar/browser'

const siteId = 3926319
const hotjarVersion = 6

Hotjar.init(siteId, hotjarVersion)

export default function EmissionsWrap() {
  const { mutate, data, error, isLoading } =
    api.emissions.getEmissions.useMutation()

  console.log(error)

  return (
    <>
      <EmissionsForm mutate={mutate} isClicked={!!data} isLoading={isLoading} />

      {error && (
        <div className="text-center font-bold bg-red-600 bg-opacity-75 p-4 rounded-md text-white">
          Nastala chyba: {error.message}
        </div>
      )}

      {data && <EmissionResults data={data} />}
    </>
  )
}
