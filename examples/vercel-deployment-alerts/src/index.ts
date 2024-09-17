import { Buffer } from 'buffer'
import crypto from 'crypto'

const VERCEL_WEBHOOK_SECRET = process.env.VERCEL_WEBHOOK_SECRET
const CAMPSITE_API_KEY = process.env.CAMPSITE_API_KEY
const CAMPSITE_DEPLOYMENTS_CHANNEL_ID = '<YOUR_CHANNEL_ID>'

interface CampsiteResponse {
  id: string
  url: string
  title: string
  content: string
  created_at: string
  channel: {
    id: string
    name: string
  }
}

export async function sendCampsiteAlert(title: string, content: string): Promise<CampsiteResponse> {
  if (!CAMPSITE_API_KEY) {
    throw new Error('CAMPSITE_API_KEY is not defined in the environment variables')
  }

  const body = {
    title,
    content_markdown: content,
    channel_id: CAMPSITE_DEPLOYMENTS_CHANNEL_ID
  }

  const response = await fetch('https://api.campsite.com/v2/posts', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${CAMPSITE_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  })

  if (!response.ok) {
    throw new Error(`Failed to send Campsite alert: ${response.statusText}`)
  }

  const data: CampsiteResponse = await response.json()
  return data
}

function verifySignature(rawBody: string, signature: string | null): boolean {
  if (typeof VERCEL_WEBHOOK_SECRET !== 'string') {
    throw new Error('No Vercel webhook secret found')
  }

  const rawBodyBuffer = Buffer.from(rawBody, 'utf-8')
  const bodySignature = sha1(rawBodyBuffer, VERCEL_WEBHOOK_SECRET)

  return bodySignature === signature
}

function sha1(data: Buffer, secret: string): string {
  return crypto.createHmac('sha1', secret).update(data.toString('utf-8')).digest('hex')
}

function generateDetailedContent(body: any, title: string): string {
  const payload = body.payload || {}
  const meta = payload.deployment?.meta || {}
  const regions = payload.regions || []

  return `
## Project Details
- **Project Name**: ${payload.name ? `[${payload.name}](${payload.url || ''})` : 'N/A'}
- **Deployment URL**: ${payload.url ? `[${payload.url}](https://${payload.url})` : 'N/A'}
- **Inspect Deployment**: ${
    payload.deployment?.inspectorUrl ? `[View on Vercel](${payload.deployment.inspectorUrl})` : 'N/A'
  }

## Commit Information
- **Author**: ${meta.githubCommitAuthorName || 'N/A'} ${
    meta.githubCommitAuthorLogin
      ? `([@${meta.githubCommitAuthorLogin}](https://github.com/${meta.githubCommitAuthorLogin}))`
      : ''
  }
- **Commit Message**: ${meta.githubCommitMessage || 'N/A'}
- **Branch**: ${meta.githubCommitRef || 'N/A'}
- **Commit SHA**: ${
    meta.githubCommitSha
      ? `[\`${meta.githubCommitSha.substring(0, 7)}\`](https://github.com/${
          meta.githubOrg || ''
        }/${meta.githubRepo || ''}/commit/${meta.githubCommitSha})`
      : 'N/A'
  }

## Repository Information
- **Repository**: ${
    meta.githubOrg && meta.githubRepo
      ? `[${meta.githubOrg}/${meta.githubRepo}](https://github.com/${meta.githubOrg}/${meta.githubRepo})`
      : 'N/A'
  }
- **Visibility**: ${meta.githubRepoVisibility || 'N/A'}

## Deployment Regions
${regions.length > 0 ? regions.map((region: string) => `- ${region}`).join('\n') : 'N/A'}

## Links
- **View Deployment**: ${payload.links?.deployment || 'N/A'}
- **View Project**: ${payload.links?.project || 'N/A'}
  `
}

export default async function handler(request: Request) {
  const body = await request.json()
  const signature = request.headers.get('x-vercel-signature')

  if (!verifySignature(body, signature!)) {
    return new Response('Failed to verify signature', { status: 401 })
  }

  let title = ''
  let content = ''

  switch (body.type) {
    case 'deployment.created':
      title = '🚀 Deployment Created'
      content = generateDetailedContent(body, title)
      break
    case 'deployment.succeeded':
      title = '✅ Deployment Succeeded'
      content = generateDetailedContent(body, title)
      break
    case 'deployment.failed':
      title = '❌ Deployment Failed'
      content = generateDetailedContent(body, title)
      break
    case 'deployment.canceled':
      title = '🚫 Deployment Canceled'
      content = generateDetailedContent(body, title)
      break
    case 'deployment.promoted':
      title = '🔼 Deployment Promoted'
      content = generateDetailedContent(body, title)
      break
    default:
      title = `📣 Vercel Event: ${body.type || 'Unknown'}`
      content = generateDetailedContent(body, title)
  }

  try {
    await sendCampsiteAlert(title, content)
    return new Response('Alert sent to Campsite', { status: 200 })
  } catch (error) {
    return new Response('Failed to send alert to Campsite', { status: 500 })
  }
}
