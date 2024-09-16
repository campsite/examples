# Stripe New Customer Webhook

This is an example of a Stripe webhook that creates a new post in Campsite when a new subscription is created.

### Prerequisites

The following environment variables are required:

```bash
CAMPSITE_API_KEY=<YOUR_API_KEY>
STRIPE_SECRET_KEY=<YOUR_API_KEY>
STRIPE_WEBHOOK_SECRET=<YOUR_WEBHOOK_SECRET>
```

_This code is provided as an example and is not intended to be deployed as-is. Adapt the code in `src/index.ts` to fit your use case and deployment environment._
