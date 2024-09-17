# GitHub Release Alerts Workflow

This workflow creates a post in Campsite when a new release is created.

### Prerequisites

This workflow expects the following secrets to be set in the repository:

- `CAMPSITE_API_KEY`: The API key for the Campsite API (we suggest creating a dedicated "GitHub" integration for this)
- `CAMPSITE_RELEASES_CHANNEL_ID`: The ID of the channel in Campsite where release alerts should be posted

_Thanks to [@conarro](https://github.com/conarro) for the original implementation of this workflow._
