const edgeChromium = require('chrome-aws-lambda')

const determineCoverage = (cssCoverage, jsCoverage) => {
  // Examine JS Coverage
  const jsCoverageArray = [...jsCoverage]
  let jsUsedBytes = 0
  let jsTotalBytes = 0
  let coveredJs = ''
  for (const entry of jsCoverageArray) {
    jsTotalBytes += entry.text.length
    console.log(`Total Bytes for ${entry.url}: ${entry.text.length}`)
    for (const range of entry.ranges) {
      jsUsedBytes += range.end - range.start - 1
      coveredJs += entry.text.slice(range.start, range.end) + '\n'
    }
  }

  console.log(`Total Bytes of JS: ${jsTotalBytes}`)
  console.log(`Used Bytes of JS: ${jsUsedBytes}`)

  // Examine CSS Coverage
  const cssCoverageArray = [...cssCoverage]
  let cssUsedBytes = 0
  let cssTotalBytes = 0
  let coveredCss = ''
  for (const entry of cssCoverageArray) {
    cssTotalBytes += entry.text.length
    console.log(`Total Bytes for ${entry.url}: ${entry.text.length}`)
    for (const range of entry.ranges) {
      cssUsedBytes += range.end - range.start - 1
      coveredCss += entry.text.slice(range.start, range.end) + '\n'
    }
  }

  console.log(`Total Bytes of CSS: ${cssTotalBytes}`)
  console.log(`Used Bytes of CSS: ${cssUsedBytes}`)

  return { cssTotalBytes, cssUsedBytes, jsTotalBytes, jsUsedBytes }
}

const calculatePageSize = async (url) => {
  console.log(url)

  //initiate the browser
  const executablePath = await edgeChromium.executablePath

  const browser = await edgeChromium.puppeteer.launch({
    executablePath,
    args: edgeChromium.args,
    headless: false,
  })

  //create a new in headless chrome
  const page = await browser.newPage()

  const results = []
  let fullSize = 0

  console.log('test 2')

  await page.setRequestInterception(true)
  page.on('request', (request) => {
    console.log('request')

    results.push(request.url())

    request.continue().catch((err) => {
      console.error(err)
    })
  })

  page.on('requestfinished', async (request) => {
    console.log('request finished')

    const response = request.response()

    const responseHeaders = response?.headers()

    let responseBody
    if (request.redirectChain().length === 0) {
      // body can only be access for non-redirect responses
      try {
        responseBody = await response?.buffer()
      } catch (err) {
        console.log('responseBody err', err)
      }
    }

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

    request.continue().catch((err) => {
      console.error(err)
    })
  })

  await Promise.all([
    page.coverage.startJSCoverage(),
    page.coverage.startCSSCoverage(),
  ])

  console.log('goTO1')
  //go to target website
  await page.goto(url, {
    //wait for content to load
    waitUntil: 'load',
  })
  console.log('scroll1')

  await autoScroll(page)

  const firstLoad = fullSize
  fullSize = 0

const coverage =  []
  try{const [jsCoverage, cssCoverage] = await Promise.all([
    page.coverage.stopJSCoverage(),
    page.coverage.stopCSSCoverage(),
  ])
    
    coverage.push(jsCoverage, cssCoverage)
  }
  catch(e) {
    console.log('e',e)
  }
  console.log(coverage)

  // console.log('goTO', jsCoverage, cssCoverage)
  await page.goto(url, {
    //wait for content to load
    waitUntil: 'load',
  })
  console.log('scroll')

  await autoScroll(page)

  //close headless chrome
  await browser.close()
  
  let determinedCoverage
  if(coverage.length) determinedCoverage= determineCoverage(coverage[1], coverage[0]) 
  
  
  

  return { firstLoad, secondLoad: fullSize, determinedCoverage //: coverage
  // coverage: determineCoverage(cssCoverage, jsCoverage) 
    
  }
}

const autoScroll = async (page) => {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0
      const distance = 100
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight
        window.scrollBy(0, distance)
        totalHeight += distance

        if (totalHeight >= scrollHeight - window.innerHeight) {
          clearInterval(timer)
          resolve(null)
        }
      }, 100)
    })
  })
}

exports.handler = async (event) => {
  const sizes = await calculatePageSize(event?.queryStringParameters?.url)

  const response = {
    statusCode: 200,
    body: JSON.stringify(sizes),
  }
  return response
}
