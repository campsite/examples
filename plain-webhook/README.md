# Plain Webhook

This example handles incoming webhooks from [Plain](https://www.plain.com/) and cross-posts updates to Campsite. New threads are created as posts in Campsite with an optional AI-generated title, and replies are added as comments to the original post.

We use Plain's [Thread Fields API](https://www.plain.com/docs/api-reference/graphql/threads/thread-fields) to store the Campsite post ID on a thread so we can look it up later when adding comments. If your support platform doesn't support storing arbitrary metadata on conversations, you can use a service like [Vercel KV](https://vercel.com/docs/storage/vercel-kv) to store a lookup table.

### Prerequisites

The following environment variables are required:

```bash
CAMPSITE_API_KEY=<YOUR_API_KEY>
PLAIN_API_KEY=<YOUR_API_KEY>

# Optional; enables AI-generated titles
OPENAI_API_KEY=<YOUR_API_KEY>
```

_This code is provided as an example and is not intended to be deployed as-is. Adapt the code in `src/index.ts` to fit your use case and deployment environment._
