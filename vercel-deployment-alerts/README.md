# Vercel Deployment Alerts

This is an example of a Vercel webhook that creates a new post in Campsite when a new deployment is created.

### Prerequisites

The following environment variables are required:

```bash
CAMPSITE_API_KEY=<YOUR_API_KEY>

# Optional, if deploying to Vercel:
VERCEL_WEBHOOK_SECRET=<YOUR_WEBHOOK_SECRET>
```

_This code is provided as an example and is not intended to be deployed as-is. Adapt the code in `src/index.ts` to fit your use case and deployment environment._
