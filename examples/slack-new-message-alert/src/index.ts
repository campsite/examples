import { WebClient } from '@slack/web-api'

const CAMPSITE_CHANNEL_ID = '0l96cxq9jb83'
const CAMPSITE_API_KEY = process.env.CAMPSITE_API_KEY
const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN

const slackClient = new WebClient(SLACK_BOT_TOKEN)

async function getSlackChannelName(channelId: string) {
  const channelInfo = await slackClient.conversations.info({ channel: channelId })
  if (channelInfo.ok && channelInfo.channel?.name) {
    return channelInfo.channel.name
  }
  return channelId
}

async function getSlackUserRealName(userId: string) {
  const userInfo = await slackClient.users.info({ user: userId })
  if (userInfo.ok && userInfo.user?.real_name) {
    return userInfo.user.real_name
  }
  return userId
}

async function getMessagePermalink(channelId: string, messageTs: string) {
  const permalink = await slackClient.chat.getPermalink({
    channel: channelId,
    message_ts: messageTs
  })
  return permalink.permalink
}

export default async function server(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const slackPayload = await request.json()

  if (slackPayload.type === 'url_verification') {
    return new Response(slackPayload.challenge, { status: 200 })
  }

  // Only respond to new message events
  if (slackPayload.type === 'event_callback' && slackPayload.event.type === 'message') {
    const message = slackPayload.event

    // Ignore bot messages and message edits
    if (message.subtype === 'bot_message' || message.subtype === 'message_changed') {
      return new Response('OK', { status: 200 })
    }

    const [senderName, channelName, messageUrl] = await Promise.all([
      getSlackUserRealName(message.user),
      getSlackChannelName(message.channel),
      getMessagePermalink(message.channel, message.ts)
    ])

    const campsitePayload = {
      title: `Slack message from ${senderName}`,
      content_markdown: `**${senderName}** posted in #${channelName} on Slack:\n\n${message.text}\n\n[View on Slack](${messageUrl})`,
      channel_id: CAMPSITE_CHANNEL_ID
    }

    try {
      const campsiteResponse = await fetch('https://api.campsite.com/v2/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${CAMPSITE_API_KEY}`
        },
        body: JSON.stringify(campsitePayload)
      })

      if (!campsiteResponse.ok) {
        throw new Error(`Campsite API error: ${campsiteResponse.statusText}`)
      }

      return new Response('Message cross-posted to Campsite', { status: 200 })
    } catch (error) {
      console.error('Error posting to Campsite:', error)
      return new Response('Error posting to Campsite', { status: 500 })
    }
  }

  return new Response('OK', { status: 200 })
}
