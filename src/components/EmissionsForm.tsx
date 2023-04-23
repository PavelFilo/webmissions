import { type FormEvent, useState } from 'react'

import { Spinner } from './Spinner'

interface IEmissionsFormProps {
  mutate: (variables: { url: string }) => void
  isLoading?: boolean
  isClicked?: boolean
}

export const EmissionsForm = ({
  mutate,
  isLoading,
  isClicked,
}: IEmissionsFormProps) => {
  const [url, setUrl] = useState<string>('')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()

    mutate({ url: url })
  }

  return (
    <form
      className="mx-auto flex w-full max-w-lg flex-shrink justify-center px-2 font-secondary"
      onSubmit={handleSubmit}
    >
      <input
        className="w-2/3 rounded-l-lg border border-r-0 border-palette-light px-3
              focus:outline-none focus:ring-1 focus:ring-palette-primary"
        type="url"
        required
        placeholder="Type url here"
        onChange={(e) => setUrl(e.target.value)}
      />
      <button
        type="submit"
        className={`
          ${isClicked ? 'opacity-75' : ''}
          rounded-r-lg border border-transparent bg-palette-primary py-3 px-4 text-sm font-semibold text-white hover:bg-palette-light focus:outline-none 
          focus-visible:ring-2 focus-visible:ring-palette-primary focus-visible:ring-offset-2 sm:text-base`}
      >
        {isLoading ? <Spinner /> : 'Get Emissions'}
      </button>
    </form>
  )
}
