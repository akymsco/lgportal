import 'dotenv/config';

const OWNER = "akymsco";
const REPO = "lgportal";
const BASE_PATH = "myproject/blog/news";

exports.handler = async (event) => {
  try {
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const data = JSON.parse(event.body);
    const slug = data.slug;

    if(!slug) throw new Error("Slug is required for deletion");

    // Get index.json
    const indexRes = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${BASE_PATH}/index.json`, {
      headers:{ Authorization: `token ${GITHUB_TOKEN}` }
    });
    const indexFile = await indexRes.json();
    let indexContent = JSON.parse(Buffer.from(indexFile.content,"base64").toString());

    // Remove post
    indexContent = indexContent.filter(p => p.slug !== slug);

    // Update index.json
    await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${BASE_PATH}/index.json`, {
      method:"PUT",
      headers:{
        Authorization: `token ${GITHUB_TOKEN}`,
        "Content-Type":"application/json"
      },
      body: JSON.stringify({
        message: `Delete post ${slug}`,
        content: Buffer.from(JSON.stringify(indexContent,null,2)).toString("base64"),
        sha: indexFile.sha
      })
    });

    // Delete post file
    const postRes = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${BASE_PATH}/${slug}.json`, {
      headers:{ Authorization:`token ${GITHUB_TOKEN}` }
    });
    const postFile = await postRes.json();

    await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${BASE_PATH}/${slug}.json`, {
      method:"DELETE",
      headers:{ Authorization:`token ${GITHUB_TOKEN}` },
      body: JSON.stringify({
        message: `Delete post ${slug}`,
        sha: postFile.sha
      })
    });

    return { statusCode:200, body: JSON.stringify({ success:true, slug }) };

  } catch(err) {
    return { statusCode:500, body: JSON.stringify({ success:false, error: err.message }) };
  }
};