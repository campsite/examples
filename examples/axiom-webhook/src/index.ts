const CAMPSITE_API_KEY = process.env.CAMPSITE_API_KEY
const CAMPSITE_ALERTS_THREAD_ID = 'sdcup465jb7y'

export default async function server(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const payload = await request.json()

  // Modify this to suit your needs, e.g. for threshold alerts vs. match alerts
  const status = payload.action === 'Open' ? '🔴 Monitor triggered' : '🟢 Monitor resolved'

  const message = `**${status}: ${payload.event.title}**\n${payload.event.body}`

  try {
    const campsiteResponse = await fetch(`https://api.campsite.com/v2/threads/${CAMPSITE_ALERTS_THREAD_ID}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${CAMPSITE_API_KEY}`
      },
      body: JSON.stringify({
        content_markdown: message
      })
    })

    if (!campsiteResponse.ok) {
      throw new Error(`Campsite API error: ${campsiteResponse.statusText}`)
    }

    return new Response('OK', { status: 200 })
  } catch (error) {
    console.error('Error posting to Campsite:', error)
    return new Response('Error posting to Campsite', { status: 500 })
  }
}
