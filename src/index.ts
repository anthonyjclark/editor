import { Application } from 'probot' // eslint-disable-line no-unused-vars

export = (app: Application) => {

    app.on(['pull_request.opened', 'pull_request.synchronized'], async (context) => {
        // const issueComment = context.issue({ body: 'Thanks for opening this issue!' })
        // await context.github.issues.createComment(issueComment)

        const owner = context.payload.repository.owner.login
        const repo = context.payload.repository.name
        const number = context.payload.number

        let page = 0

        const prFiles = await context.github.pullRequests.listFiles({
            owner,
            repo,
            number,
            per_page: 100,
            page
        })

        for (const file of prFiles.data) {

            // Skip non markdown files (must end with .md)
            if (!file.filename.endsWith('.md')) {
                return
            }

            const lines = file.patch.split('\n')
            // context.log(file.patch)

            let yamlGuardCount = 0
            for (const line of lines) {

                // Skip YAML header
                if (yamlGuardCount < 2 && line.startsWith('+---')) {
                    yamlGuardCount += 1
                }

                if (yamlGuardCount < 2) {
                    continue
                }

                // Process Markdown line
                if (line.startsWith('+')) {

                }
            }

        }

        // TODO handle zero files
    })

}

// https://github.com/koddsson/eslint-disable-probot/blob/master/index.js
