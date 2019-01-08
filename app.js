const marked = require('marked')
const atob = require('atob')
const Proofreader = require('proofreader')

function nthIndex (str, pat, n) {
  const L = str.length
  let i = -1
  while (n-- && i++ < L) {
    i = str.indexOf(pat, i)
    if (i < 0) break
  }
  return i
}

function formatResults (results) {
  let prettyOutput = 'Hello, this is an Editor bot.\n\n'
  prettyOutput += 'The following is a list of grammar/style suggestions and'
  prettyOutput += ' possible spelling mistakes. These are just suggestions, but'
  prettyOutput += ' you should consider them all and push any changes to your'
  prettyOutput += ' pull request branch.\n\n'

  results.forEach(function (result) {
    var writeGood = result.suggestions.writeGood
    var spelling = result.suggestions.spelling

    if (writeGood.length || spelling.length) {
      prettyOutput += '**Your text:** *' + result.text + '*\n'

      writeGood.forEach(function (item) {
        prettyOutput += ' - ' + item.reason + '\n'
      })

      spelling.forEach(function (item) {
        prettyOutput += ' - "*' + item.word + '*" -> ' + item.suggestions + '\n'
      })

      prettyOutput += '\n'
    }
  })

  return prettyOutput
}

module.exports = app => {
  app.log('Yay, the app was loaded!')

  app.on([
    'pull_request.opened',
    'pull_request.synchronize',
    'pull_request.edited'
  ], async context => {

    context.log('Responding to webhook!')

    const owner = context.payload.repository.owner.login
    const repo = context.payload.repository.name
    const number = context.payload.number

    // let page = 0

    const prFiles = await context.github.pullRequests.listFiles({
      owner,
      repo,
      number
      // per_page: 100,
      // page
    })

    const submitter = context.payload.pull_request.head.user.login
    const prRef = context.payload.pull_request.head.ref

    for (const file of prFiles.data) {
      // Skip non markdown files (must end with .md)
      const markdownFile = file.filename
      if (!markdownFile.endsWith('.md')) {
        return
      }

      // Get the full markdown file encoded as base64
      // TODO: get from PR
      // https://developer.github.com/v3/pulls/#custom-media-types

      const markdownEncoded = await context.github.repos.getContents({
        owner: submitter,
        repo,
        path: markdownFile,
        ref: prRef
      })

      // Decode and skip the yaml header
      const markdownWithHeader = atob(markdownEncoded.data.content)
      const endOfHeader = nthIndex(markdownWithHeader, '---', 2) + 3
      const markdown = markdownWithHeader.slice(endOfHeader)

      // Proofread the post and comment with suggestions
      const proofer = new Proofreader()

      proofer.proofread(marked(markdown))
        .then(async function (result) {
          const formattedResult = formatResults(result)
          context.log(formattedResult)

          const issueComment = context.issue({ body: formattedResult })
          await context.github.issues.createComment(issueComment)

          return result
        })
        .catch(function (error) {
          context.log('Proofreading failed', error)
        })
    }

    // TODO handle zero files
  })
}
