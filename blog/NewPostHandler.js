const request = require('request-promise-native')
const Twitter = require('twitter-lite')

const client = new Twitter({
  consumer_key: process.env.TWITTER_API_KEY,
  consumer_secret: process.env.TWITTER_API_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN,
  access_token_secret: process.env.TWITTER_ACCESS_SECRET,
})

async function twit(filename, raw_url) {
  console.log(`filename=${filename}, raw_url=${raw_url}`)

  const url = filename.replace('content', process.env.BLOG_URL).replace('.md', '')
  const raw = await request.get({ uri: raw_url })

  const title = JSON.parse(raw.match(/\n?title:(.*)\n?/)[1])
  const tags = JSON.parse(raw.match(/\n?tags:(.*)\n?/)[1]).map(t => '#' + t).join(' ')
  const status = `"${title}" başlıklı yazıma göz atabilirsiniz. Bu yazıda ${tags} gibi konulardan bahsettim: ${url}`
  console.log(`Gönderilecek olan twit: ${status}`)

  const response = await client.post("statuses/update", {
    status,
  });
  console.log('Twitter response: ' + JSON.stringify(response))
}

/*
event.body şuna benziyor (JSON.parse'tan sonra):

{
  "state": "ready",
  "url": "https://blog.selcukcihan.com",
  "commit_ref": "b623b20cef5068651f3c622fc7f38715c65b0cdf",
  "branch": "master",
  "commit_url": "https://github.com/selcukcihan/defter/commit/b623b20cef5068651f3c622fc7f38715c65b0cdf",
  "committer": "selcukcihan",
  "manual_deploy": false
}
*/

module.exports.announceBlogPost = async (event, context) => {
  console.log('Gelen event: ' + JSON.stringify(event));
  const body = JSON.parse(event.body)

  const uri = process.env.GITHUB_COMMIT_URI_PREFIX + body.commit_ref;

  const commit = await request.get({
    uri: uri,
    auth: {
      user: process.env.GITHUB_USERNAME,
      pass: process.env.GITHUB_ACCESS_TOKEN,
      sendImmediately: false
    },
    headers: {
      'User-Agent': process.env.GITHUB_USERNAME,
    },
    json: true,
  })
  /* Gelen cevap şuna benziyor:
    {
      "files": [
        {
          "sha": "34760e92bbfa06bff8681da09175e7f527e99ed4",
          "filename": "content/bulut-bilisim/s3-puf-noktalar.md",
          "status": "added",
        }
      ]
    }
  */

  if (commit.files && commit.files.length > 0) {
    const addedFiles = commit.files.filter(f => f['status'] === 'added' && f['filename'].endsWith('.md'));
    await twit(addedFiles[0]['filename'], addedFiles[0]['raw_url'])
  }

  return {
    statusCode: 200,
    body: JSON.stringify('OK')
  }
};

