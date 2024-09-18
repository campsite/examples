# Slack New Message Alert

This example creates a webhook handler for a Slack bot that creates a post in Campsite when a new message is posted to a specific Slack channel.

_This code is provided as an example and is not intended to be deployed as-is. Adapt the code in `src/index.ts` to fit your use case and deployment environment._

### Slack app setup

This example uses a Slack app to listen for new messages in a specific Slack channel. Follow these steps to set up the Slack app:

1. Create a new Slack app at https://api.slack.com/apps
2. Under **OAuth & Permissions**, add the following **Bot Token Scopes**:

- `channels:history`
- `channels:join`
- `channels:read`
- `users:read`

3. Under **Event Subscriptions**, enable events. Under **Request URL**, enter the URL of your deployed webhook handler.
4. Under **Subscribe to bot events**, add the following events:

- `message.channels`

5. Install the app to your workspace
6. Copy the `SLACK_BOT_TOKEN` and add it to your environment variables
7. Create an integration in Campsite and add its API key as a `CAMPSITE_API_KEY` environment variable
8. Add the bot to whichever channel(s) you'd like to monitor for new messages
