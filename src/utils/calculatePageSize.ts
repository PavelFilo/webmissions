export const calculatePageSize = async (url: string): Promise<number> => {
  // fetch data from external input.url and get size of response

  const response = await fetch(
    'https://mlalr52pgg.execute-api.eu-north-1.amazonaws.com/prod/calculate?url=' +
      url,
    {
      headers: {
        'Content-Type': 'application/json',
        Accept: '*/*',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers':
          'Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With',
        'X-Api-Key': process.env.NEXT_PUBLIC_AWS_API_KEY || '',
      },
    }
  )

  const fullSize = (await response.json()) as number

  return fullSize
}
