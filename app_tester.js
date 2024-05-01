const fs = require('fs')
const readline = require('readline')
const puppeteer = require('puppeteer')

var rd = readline.createInterface({
  input: fs.createReadStream('topHalfMilion.csv'),
  console: false,
})

const lines = []

rd.on('line', function (line) {
  lines.push(line)
})

rd.on('close', async () => {
  const batches = []
  const batchSize = 10

  for (let i = 0; i < lines.length; i += batchSize) {
    batches.push(lines.slice(i, i + batchSize))
  }

  for (let j = 0; j < batches.length; j += 1) {
    await Promise.all(
      batches[j].map(async (line) => {
        const res = await fetch(
          'http://localhost:3000/api/trpc/emissions.getEmissions',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Referer: 'http://localhost:3000/',
            },
            body: `{"json":{"url":"https://${line}"}}`,
          }
        )

        console.log(line, res.status, j)
      })
    )
  }
})
