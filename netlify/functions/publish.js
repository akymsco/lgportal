import 'dotenv/config'; // load .env variables

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const OWNER = "akymsco";
const REPO = "lgportal";
const BASE_PATH = "myproject/blog/news";

export async function handler(event) {
  const data = JSON.parse(event.body);

  // example slug creation
  const slug = data.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g,"-")
    .replace(/(^-|-$)/g,"");

  // create post data
  const postData = {
    title: data.title,
    content: data.content,
    image: data.image || "",
    date: new Date().toISOString(),
    slug
  };

  // fetch index.json from GitHub
  const indexRes = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${BASE_PATH}/index.json`, {
    headers: { Authorization: `token ${GITHUB_TOKEN}` }
  });

  const indexFile = await indexRes.json();
  const indexContent = JSON.parse(Buffer.from(indexFile.content, "base64").toString());

  // add new post
  indexContent.push({
    title: postData.title,
    slug,
    date: postData.date,
    image: postData.image
  });

  // update index.json
  await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${BASE_PATH}/index.json`, {
    method: "PUT",
    headers: { Authorization: `token ${GITHUB_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      message: `Add post ${slug}`,
      content: Buffer.from(JSON.stringify(indexContent, null, 2)).toString("base64"),
      sha: indexFile.sha
    })
  });

  // create individual post JSON
  await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${BASE_PATH}/${slug}.json`, {
    method: "PUT",
    headers: { Authorization: `token ${GITHUB_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      message: `Create post ${slug}`,
      content: Buffer.from(JSON.stringify(postData, null, 2)).toString("base64")
    })
  });

  return { statusCode: 200, body: JSON.stringify({ success: true }) };
}