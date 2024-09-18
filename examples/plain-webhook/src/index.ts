import { openai } from '@ai-sdk/openai'
import { parsePlainWebhook, PlainClient, ThreadFieldSchemaType } from '@team-plain/typescript-sdk'
import { generateText } from 'ai'

const PLAIN_API_KEY = process.env.PLAIN_API_KEY!
const CAMPSITE_API_KEY = process.env.CAMPSITE_API_KEY!

const SUPPORT_CHANNEL_ID = '<YOUR_CHANNEL_ID>'

const THREAD_FIELD_POST_ID_KEY = 'campsite_post_id'
const THREAD_FIELD_POST_URL_KEY = 'campsite_post_url'

const GENERATE_TITLE = !!process.env.OPENAI_API_KEY

const plainClient = new PlainClient({
  apiKey: PLAIN_API_KEY
})

type CreatePostRequest = {
  title: string
  content_markdown: string
  channel_id: string
}

type CreateCommentRequest = {
  content_markdown: string
  parent_id?: string
}

async function createPost(body: CreatePostRequest) {
  const response = await fetch('https://api.campsite.com/v2/posts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${CAMPSITE_API_KEY}`
    },
    body: JSON.stringify(body)
  }).then((res) => res.json())

  return response
}

async function createComment(postId: string, body: CreateCommentRequest) {
  const response = await fetch(`https://api.campsite.com/v2/posts/${postId}/comments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${CAMPSITE_API_KEY}`
    },
    body: JSON.stringify(body)
  }).then((res) => res.json())

  return response
}

/**
 * Gets the post ID from a Plain thread.
 * Uses Plain's Thread Fields API [1] to store the post ID whenever a new thread is created.
 *
 * [1] https://www.plain.com/docs/api-reference/graphql/threads/thread-fields
 */
async function getPostIdFromThread(threadId: string): Promise<string | null> {
  const threadData = await plainClient.getThread({ threadId })

  if (threadData.error || !threadData.data) {
    throw new Error(threadData.error?.message ?? 'Failed to get thread data')
  }

  const postIdField = threadData.data.threadFields.find((field) => field.key === THREAD_FIELD_POST_ID_KEY)

  if (!postIdField) {
    console.log('No post ID field found')
    return null
  }

  return postIdField.stringValue
}

function viewThreadLink(workspaceId: string, threadId: string) {
  return `[View in Plain](https://app.plain.com/workspace/${workspaceId}/thread/${threadId})`
}

/**
 * Uses AI to generate a title for the post based on the contents of the message.
 * Requires process.env.OPENAI_API_KEY to be set.
 */
async function generateTitle(message: string) {
  const { text } = await generateText({
    model: openai('gpt-4-turbo'),
    system: `
      Create a brief, professional email subject based on the contents of an email.
      Incorporate the most important keywords or themes from the conversation into the title.
      Format the title as plain text using sentence case.
      Use up to 8 words.
      Use only plain text, no markdown, quotations, or other stylistic punctuation.
      Write in third person, active voice, and avoid AI speak.
    `,
    prompt: message
  })
  return text
}

export default async function (req: Request) {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Only POST requests allowed' }, { status: 200 })
  }

  const body = await req.json()
  const parseResult = parsePlainWebhook(body)

  if (parseResult.error) {
    console.log({ body, parseResult })
    return Response.json(parseResult.error, { status: 400 })
  }

  const webhookBody = parseResult.data

  if (webhookBody.payload.eventType === 'thread.thread_created') {
    const { thread } = webhookBody.payload

    const content = [
      thread.previewText,
      `From ${thread.customer.fullName} (${thread.customer.email.email})`,
      viewThreadLink(webhookBody.workspaceId, thread.id)
    ].join('\n\n')

    let title = `${thread.title} (${thread.customer.email.email})`

    if (GENERATE_TITLE) {
      try {
        title = await generateTitle(content)
      } catch (error) {
        console.log('Failed to generate AI title:', error)
      }
    }

    const post = await createPost({
      title,
      content_markdown: content,
      channel_id: SUPPORT_CHANNEL_ID
    })

    if (!post.id) {
      throw new Error('Failed to create post')
    }

    await plainClient.upsertThreadField({
      identifier: {
        key: THREAD_FIELD_POST_ID_KEY,
        threadId: thread.id
      },
      type: ThreadFieldSchemaType.String,
      stringValue: post.id
    })

    await plainClient.upsertThreadField({
      identifier: {
        key: THREAD_FIELD_POST_URL_KEY,
        threadId: thread.id
      },
      type: ThreadFieldSchemaType.String,
      stringValue: post.url
    })

    console.log('Created post:', { post })
  } else if (webhookBody.payload.eventType === 'thread.email_received') {
    const { thread, email } = webhookBody.payload

    const postId = await getPostIdFromThread(thread.id)

    if (postId) {
      console.log('Reply webhookBody', webhookBody)

      const contentParts = [
        `**Reply from ${thread.customer.fullName} (${thread.customer.email.email}):**`,
        email.markdownContent || email.textContent || '*No content*',
        viewThreadLink(webhookBody.workspaceId, thread.id)
      ]

      try {
        const comment = await createComment(postId, {
          content_markdown: contentParts.join('\n\n')
        })

        console.log('Created comment:', { comment })
      } catch (error) {
        console.log('Failed to create comment:', error)
      }
    }
  } else if (webhookBody.payload.eventType === 'thread.email_sent') {
    const { thread, email } = webhookBody.payload

    const postId = await getPostIdFromThread(thread.id)

    if (postId) {
      const contentParts = [
        `**${email.from.name} replied:**`,
        email.markdownContent || email.textContent || '*No content*',
        viewThreadLink(webhookBody.workspaceId, thread.id)
      ]

      try {
        const comment = await createComment(postId, {
          content_markdown: contentParts.join('\n\n')
        })

        console.log('Created comment:', { comment })
      } catch (error) {
        console.log('Failed to create comment:', error)
      }
    }
  }

  return new Response('OK')
}
