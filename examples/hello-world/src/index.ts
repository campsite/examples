import 'dotenv/config'

const CONTENT = `This post was created with the Campsite API.`
const CHANNEL_ID = '<YOUR_CHANNEL_ID>'

;(async () => {
  const body = {
    title: 'Hello World',
    content_markdown: CONTENT,
    channel_id: CHANNEL_ID
  }

  const response = await fetch('https://api.campsite.com/v2/posts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.CAMPSITE_API_KEY}`
    },
    body: JSON.stringify(body)
  })

  console.log(await response.json())
})()
