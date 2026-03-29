exports.handler = async (event) => {

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const OWNER = "akymsco";
const REPO = "lgportal";
const BASE_PATH = "myproject/blog/news";

const data = JSON.parse(event.body);
const slug = data.slug;

// ===================
// GET FILE
// ===================
const res = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${BASE_PATH}/${slug}.json`, {
  headers:{Authorization:`token ${GITHUB_TOKEN}`}
});

const file = await res.json();

// ===================
// UPDATE DATA
// ===================
const updated = {
  title: data.title,
  content: data.content,
  image: data.image || "",
  date: new Date().toISOString()
};

// ===================
// PUSH UPDATE
// ===================
await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${BASE_PATH}/${slug}.json`, {
  method:"PUT",
  headers:{
    Authorization:`token ${GITHUB_TOKEN}`,
    "Content-Type":"application/json"
  },
  body: JSON.stringify({
    message:"Update post",
    content: Buffer.from(JSON.stringify(updated,null,2)).toString("base64"),
    sha: file.sha
  })
});

return {
  statusCode:200,
  body: JSON.stringify({success:true})
};

};