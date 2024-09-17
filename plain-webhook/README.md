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

### How we use it

We use this internally to cross-post support channel updates to a "Plain" channel in Campsite. Each thread gets a new post with an AI-generated title, keeping discussions organized and easy to identify. Replies are added to the thread as comments, and we also use the comments to discuss support issues and feature requests internally.

![image](https://github.com/user-attachments/assets/a6cb82fe-62d4-4c87-a56d-1c51d58746b3)
