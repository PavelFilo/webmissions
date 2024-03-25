// component that shows result categories, values and descriptions one below the other
// props: emissionResults: array of objects with category, value and description

interface IData {
  url: string
  total: number
  emissionResults: {
    category: string
    value: number | string
    description: string
  }[]
}

export const EmissionResults = ({ data }: { data: IData }) => {
  return (
    <div className="divide-gray-40 divide-y rounded-lg bg-palette-dark bg-opacity-80 p-4">
      <div className="flex flex-col">
        <div className="flex items-center justify-between">
          <h3 className="font-primary text-lg font-bold text-white text-left">
            Celkové emisie
          </h3>

          <p className="font-secondary flex-shrink-0 text-white">
            {data.total.toFixed(2)}g Co2
          </p>
        </div>
        <p className="text-left font-secondary text-white">
          Emisie Co2 produkované aplikáciou
        </p>
      </div>
      {data.emissionResults.map((result) => (
        <div
          key={result.category}
          className="my-2 flex flex-col space-y-1 pt-2"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-primary text-lg font-bold text-white text-left">
              {result.category}
            </h3>
            <p className="font-secondary flex-shrink-0 text-white">
              {result.value}
            </p>
          </div>
          <p className="text-left font-secondary text-white">
            {result.description}
          </p>
        </div>
      ))}
    </div>
  )
}
