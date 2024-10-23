# GitHub PR Alerts Workflow

This workflow creates a chat message in Campsite when a pull request is opened, closed, or merged.

### Prerequisites

This workflow expects the following secrets to be set in the repository:

- `CAMPSITE_API_KEY`: The API key for the Campsite API (we suggest creating a dedicated "GitHub" integration for this)
- `CAMPSITE_PR_ALERTS_THREAD_ID`: The ID of the thread in Campsite where the PR alerts should be posted

#### Using a thread

If you’re trying to send a message to a thread, you need to add the integration to the thread first:

1. Open the thread in Campsite
2. Click the ••• menu in the top corner
3. Click “Manage integrations”
4. Add your integration to the thread

### How we use it

We use this workflow internally at Campsite to post messages in a thread whenever a pull request is opened, closed, or merged. We use an API key from a custom "GitHub" integration so messages are posted as if they came from GitHub.

![Example screenshot](https://github.com/user-attachments/assets/bae4fff7-b73d-4b4d-8709-202804124f2d)
