import { type NextPage } from 'next'
import Image from 'next/image'
import { EmissionResults } from '~/components/EmissionResults'
import { EmissionsForm } from '~/components/EmissionsForm'
import { api } from '~/utils/api'

const Home: NextPage = () => {
  const { mutate, data, isLoading } = api.emissions.getEmissions.useMutation()

  return (
    <div className="relative h-screen w-screen bg-gradient-to-b">
      <Image
        className="absolute inset-0 h-full w-full object-cover mix-blend-multiply brightness-75 filter"
        alt="main background image"
        src="https://images.unsplash.com/photo-1677758363634-51c1f1f97f05?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxfDB8MXxyYW5kb218MHx8fHx8fHx8MTY3OTc0ODE3MA&ixlib=rb-4.0.3&q=80&w=1080"
        fill
      />

      <div className="absolute inset-0 mx-auto flex w-5/6 max-w-xl flex-col items-center justify-center text-center">
        <div className="space-y-8">
          <h1 className="font-primary text-3xl font-extrabold text-white sm:text-4xl md:text-5xl md:leading-tight">
            Calculate Your Web App&apos;s Carbon Footprint
          </h1>
          <p className="font-secondary  text-white md:text-lg lg:text-xl">
            With just a few clicks, you can get an estimate of your web
            app&apos;s carbon footprint and identify ways to reduce its impact
            on the environment. Try it out now and take a step towards a more
            sustainable web!
          </p>

          <EmissionsForm
            mutate={mutate}
            isClicked={!!data}
            isLoading={isLoading}
          />

          {data && <EmissionResults data={data} />}
        </div>
      </div>
    </div>
  )
}

export default Home
