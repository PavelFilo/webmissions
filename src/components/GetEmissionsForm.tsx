import { type FormEvent, useState } from 'react'

export const GetEmissionsForm = () => {
  const [email, setEmail] = useState<string>('')
  const [clicked, setClicked] = useState<boolean>(false)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setClicked(true)
    fetch('api/update-notion', {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
      },
      body: JSON.stringify({ email }),
    }).catch(() => {
      // do nothing
    })
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
        onChange={(e) => setEmail(e.target.value)}
      />
      <button
        type="submit"
        className={`
          ${clicked ? 'pointer-events-none	opacity-75' : ''}
          rounded-r-lg border border-transparent bg-palette-primary py-3 px-4 text-sm font-semibold text-white hover:bg-palette-light focus:outline-none 
          focus-visible:ring-2 focus-visible:ring-palette-primary focus-visible:ring-offset-2 sm:text-base`}
      >
        Get Emissions
      </button>
    </form>
  )
}
