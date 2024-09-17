import Stripe from 'stripe'

const CAMPSITE_API_KEY = process.env.CAMPSITE_STRIPE_APP_KEY
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET

const NEW_CUSTOMERS_CHANNEL_ID = '<YOUR_CHANNEL_ID>'

const stripe = new Stripe(STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20'
})

async function createCampsitePost(title: string, content: string) {
  const response = await fetch('https://api.campsite.com/v2/posts', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${CAMPSITE_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      title,
      content_markdown: content,
      channel_id: NEW_CUSTOMERS_CHANNEL_ID
    })
  })

  if (!response.ok) {
    throw new Error(`Failed to create Campsite post: ${response.statusText}`)
  }

  return response.json()
}

async function composeNewCustomerMessage(customerId: string, subscription: Stripe.Subscription) {
  const customer = (await stripe.customers.retrieve(customerId)) as Stripe.Customer
  const seats = subscription.items.data[0].quantity

  const title = `New customer: ${customer.name}`
  const content = `${customer.name} upgraded with ${seats} ${seats === 1 ? 'seat' : 'seats'}!`

  return { title, content }
}

export default async function handle(request: Request) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  let event
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature!, STRIPE_WEBHOOK_SECRET!, undefined)
  } catch (err) {
    console.log(err)
    return new Response((err as Error).message, { status: 400 })
  }

  try {
    if (event.type === 'customer.subscription.created') {
      const subscription = event.data.object as Stripe.Subscription

      if (subscription.status === 'active') {
        const { title, content } = await composeNewCustomerMessage(subscription.customer.toString(), subscription)

        await createCampsitePost(title, content)
      }
    } else if (event.type === 'customer.subscription.updated') {
      const subscription = event.data.object as Stripe.Subscription

      // Some subscriptions may start out as "incomplete" (e.g. requires payment method)
      // and then switch to active after payment is made. For those we will receive an `updated` alert.
      if (subscription.status === 'active' && event.data.previous_attributes?.status === 'incomplete') {
        const { title, content } = await composeNewCustomerMessage(subscription.customer.toString(), subscription)

        await createCampsitePost(title, content)
      }
    } else if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object as Stripe.Subscription

      if (subscription.status === 'canceled') {
        const customer = (await stripe.customers.retrieve(subscription.customer.toString())) as Stripe.Customer
        const seats = subscription.items.data[0].quantity

        const title = `Cancelled subscription: ${customer.name}`
        const content = `${customer.name} canceled their subscription with ${seats} ${seats === 1 ? 'seat' : 'seats'}.`

        await createCampsitePost(title, content)
      }
    }

    return new Response('Webhook handled successfully', { status: 200 })
  } catch (error) {
    console.error('Error handling webhook:', error)
    return new Response('Webhook error', { status: 400 })
  }
}
