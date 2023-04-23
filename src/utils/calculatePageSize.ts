import puppeteer from 'puppeteer'
import fs from 'fs/promises'

interface IResult {
  url: string
  requestHeaders: Record<string, string>
  requestPostData: string | undefined
  responseHeaders: Record<string, string> | undefined
  responseSize: string | undefined
  responseBodySize: number | undefined
}

export const calculatePageSize = async (url: string) => {
  //initiate the browser
  const browser = await puppeteer.launch()

  //create a new in headless chrome
  const page = await browser.newPage()

  const results: (IResult | string)[] = []
  let fullSize = 0

  await page.setRequestInterception(true)
  page.on('request', (request) => {
    results.push(request.url())

    request.continue().catch((err) => {
      console.error(err)
    })
  })

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  page.on('requestfinished', async (request) => {
    const response = request.response()
    console.log(response)
    const responseHeaders = response?.headers()

    // if (request.redirectChain().length === 0) {
    // body can only be access for non-redirect responses
    const responseBody = await response?.buffer()
    // }

    fullSize += responseBody?.length || 0

    const information = {
      url: request.url(),
      requestHeaders: request.headers(),
      requestPostData: request.postData(),
      responseHeaders,
      responseSize: responseHeaders?.['content-length'],
      responseBodySize: responseBody?.length,
    }
    results.push(information)

    request.continue().catch(() => {
      // console.error(err)
    })
  })

  //go to target website
  await page.goto(url, {
    //wait for content to load
    waitUntil: 'load',
  })

  //get full page html
  const html = await page.content()

  //store html content in the reactstorefront file
  await fs.writeFile('reactstorefront.html', html)
  await fs.writeFile('reactstorefront.json', JSON.stringify(results))

  //close headless chrome
  await browser.close()

  return fullSize
}
