# Plain Webhook

This example handles incoming webhooks from Plain and cross-posts updates to Campsite.

New threads are created as posts in Campsite with an optional AI-generated title. Replies are added as comments to the original post.

### Prerequisites

Add your Campsite API key to a .env file:

```
// .env
CAMPSITE_API_KEY=<YOUR_API_KEY>
```

### Running the script

```
// Install dependencies
pnpm i

// Run the script
pnpm start
```
