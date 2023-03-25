import { type AppType } from "next/app";

import { api } from "~/utils/api";
import Layout from '~/components/Layout'
import SEO from '~/components/SEO'

import '~/styles/globals.css'


const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <Layout>
      <SEO />
      <Component {...pageProps} />
    </Layout>
  )
}

export default api.withTRPC(MyApp);
