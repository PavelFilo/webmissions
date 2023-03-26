// component that shows result categories, values and descriptions one below the other
// props: emissionResults: array of objects with category, value and description

export const EmissionResults = ({
  total,
  emissionResults,
}: {
  total: number
  emissionResults: { category: string; value: number; description: string }[]
}) => {
  return (
    <div className="space-y-8">
      <div className="flex flex-col space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-primary text-lg font-bold text-white">
            Total emissions from your web app
          </h3>
          <p className="font-secondary text-white">{total} kg</p>
        </div>
      </div>
      {emissionResults.map((result) => (
        <div key={result.category} className="flex flex-col space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-primary text-lg font-bold text-white">
              {result.category}
            </h3>
            <p className="font-secondary text-white">{result.value} kg</p>
          </div>
          <p className="font-secondary text-white">{result.description}</p>
        </div>
      ))}
    </div>
  )
}
