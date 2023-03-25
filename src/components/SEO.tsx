import Head from "next/head";

function SEO() {
  // customize meta properties
  // you can pass them as an argument like title in case you want to change for each page

  return (
    <Head>
      <meta charSet="utf-8" />

      <meta name="description" content="Get the co2 Emissions of your Web" />

      <title>WebMissions | Get the co2 Emissions of your Web</title>

      <link rel="manifest" href="/manifest.json" />
      {/* <link
        href="/icons/icon-16x16.png"
        rel="icon"
        type="image/png"
        sizes="16x16"
        purpose="any maskable"
      />
      <link
        href="/icons/icon-32x32.png"
        rel="icon"
        type="image/png"
        sizes="32x32"
        purpose="any maskable"
      /> */}
      <link rel="apple-touch-icon" href="/apple-icon.png"></link>
      <meta name="theme-color" content="#EF4444" />
    </Head>
  );
}

export default SEO;
