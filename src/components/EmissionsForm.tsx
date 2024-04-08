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
  const [url, setUrl] = useState<string>('https://')
  const [isError, setIsError] = useState<boolean>(false)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()

    const regex = new RegExp(
      /(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,4}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g
    )

    if (regex.test(url) === false) {
      setIsError(true)
      return
    }

    mutate({ url: url.startsWith('https://') ? url : `https://${url}` })
  }

  return (
    <>
      <form
        id="emissions-form"
        className="mx-auto flex w-full max-w-lg flex-shrink justify-center px-2 font-secondary"
        onSubmit={handleSubmit}
      >
        <input
          id="emissions-input"
          className="w-2/3 rounded-l-lg border border-r-0 border-palette-light px-3
        focus:outline-none focus:ring-1 focus:ring-palette-primary"
          required
          disabled={isLoading}
          placeholder="Vložte URL adresu"
          onChange={(e) => {
            if (isError) setIsError(false)
            setUrl(e.target.value)
          }}
        />
        <button
          type="submit"
          id="submit-button"
          className={`
        ${isClicked ? 'opacity-75' : ''}
        rounded-r-lg border border-transparent bg-palette-primary py-3 px-4 text-sm font-semibold text-white hover:bg-palette-light focus:outline-none 
        focus-visible:ring-2 focus-visible:ring-palette-primary focus-visible:ring-offset-2 sm:text-base`}
        >
          {isLoading ? <Spinner /> : <p id="calculate">Vypočítať</p>}
        </button>
      </form>

      {isError && (
        <div className="text-center font-bold bg-red-600 bg-opacity-75 p-4 rounded-md text-white">
          Zadajte platnú URL adresu
        </div>
      )}
    </>
  )
}
