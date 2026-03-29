exports.handler = async (event) => {

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const OWNER = "akymsco";
const REPO = "lgportal";
const BASE_PATH = "myproject/blog/news";

const {slug} = JSON.parse(event.body);

// ===================
// GET POST FILE
// ===================
const postRes = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${BASE_PATH}/${slug}.json`, {
  headers:{Authorization:`token ${GITHUB_TOKEN}`}
});

const postFile = await postRes.json();

// ===================
// DELETE POST FILE
// ===================
await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${BASE_PATH}/${slug}.json`, {
  method:"DELETE",
  headers:{
    Authorization:`token ${GITHUB_TOKEN}`,
    "Content-Type":"application/json"
  },
  body: JSON.stringify({
    message:"Delete post",
    sha: postFile.sha
  })
});

// ===================
// UPDATE INDEX
// ===================
const indexRes = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${BASE_PATH}/index.json`, {
  headers:{Authorization:`token ${GITHUB_TOKEN}`}
});

const indexFile = await indexRes.json();

let indexContent = JSON.parse(
  Buffer.from(indexFile.content,"base64").toString()
);

indexContent = indexContent.filter(n=> n.slug !== slug);

// ===================
// SAVE NEW INDEX
// ===================
await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${BASE_PATH}/index.json`, {
  method:"PUT",
  headers:{
    Authorization:`token ${GITHUB_TOKEN}`,
    "Content-Type":"application/json"
  },
  body: JSON.stringify({
    message:"Remove post",
    content: Buffer.from(JSON.stringify(indexContent,null,2)).toString("base64"),
    sha: indexFile.sha
  })
});

return {
  statusCode:200,
  body: JSON.stringify({success:true})
};

};