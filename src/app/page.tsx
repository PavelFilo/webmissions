import Image from 'next/image'
import EmissionsWrap from '~/components/EmissionsWrap'

export default function Page() {
  return (
    <div className="relative h-screen w-screen">
      <Image
        className="absolute inset-0 h-full w-full filter lg:filter-none brightness-75  object-cover"
        alt="main background image"
        src="https://images.unsplash.com/photo-1677758363634-51c1f1f97f05?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxfDB8MXxyYW5kb218MHx8fHx8fHx8MTY3OTc0ODE3MA&ixlib=rb-4.0.3&q=80&w=1080"
        fill
      />

      <div className="absolute inset-0 flex w-screen h-screen items-center justify-center bg-radial-gradient">
        <div className="flex w-full flex-col items-center justify-center max-h-full text-center">
          <div className=" h-fit py-4 w-full overflow-auto">
            <div className="w-5/6 mx-auto flex flex-col gap-8 max-w-xl">
              <h1
                className="font-primary text-3xl font-extrabold text-white sm:text-4xl md:text-5xl md:leading-tight"
                style={{
                  textShadow: '0 0 14px rgba(0, 0, 0, 1)',
                }}
              >
                Vypočítajte uhlíkovú stopu webovej aplikácie
              </h1>

              <p
                className="font-secondary  text-white md:text-lg lg:text-xl"
                style={{
                  textShadow: '0 0 14px rgba(0, 0, 0, 1)',
                }}
              >
                Len niekoľkými kliknutiami môžete získať odhad uhlíkovej stopy
                webovej aplikácie a identifikovať spôsoby, ako znížiť jej vplyv
                na životné prostredie. Vyskúšajte to teraz a urobte krok smerom
                k udržateľnejšiemu webu!
              </p>

              <EmissionsWrap />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
