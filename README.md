
Glitch is not persistent, and Zeit now does not have the tool-chain needed to install nodehun. So, I will need to manually run the following command after each pull request (it will require an updated fixture...):

```bash
node_modules/.bin/probot receive -e pull_request -p test/fixtures/pull_request.synchronize.json ./app.js
```

Things to do:
- change to submitting a review
- break suggestions into individual comments and tag line numbers

# Editor

> A GitHub App built with [Probot](https://github.com/probot/probot) that checks for grammar and spelling errors in GitHub pull requests.

## Setup

```sh
# Install dependencies
npm install

# Run the bot
npm start
```

## Contributing

If you have suggestions for how Editor could be improved, or want to report a bug, open an issue! We'd love all and any contributions.

For more, check out the [Contributing Guide](CONTRIBUTING.md).

## License

[ISC](LICENSE) © 2019 Anthony J. Clark <anthonyjclark@gmail.com>
