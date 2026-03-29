import fetch from "node-fetch";

export async function handler(event) {
  const { title, content, image, slug } = JSON.parse(event.body);

  const repo = "akymsco/lgportal";
  const path = `myproject/blog/news/${slug}.json`;

  // get SHA
  const file = await fetch(`https://api.github.com/repos/${repo}/contents/${path}`)
    .then(res => res.json());

  const updated = { title, content, image, date: new Date(), slug };

  const res = await fetch(`https://api.github.com/repos/${repo}/contents/${path}`, {
    method:"PUT",
    headers:{
      Authorization:`token ${process.env.GITHUB_TOKEN}`,
      "Content-Type":"application/json"
    },
    body: JSON.stringify({
      message: `Publish ${title}`,
      content: Buffer.from(JSON.stringify(updated)).toString("base64"),
      sha: file.sha || undefined
    })
  });

  if(res.ok){
    return { statusCode: 200, body: "Published" };
  }else{
    const err = await res.text();
    return { statusCode: 500, body: err };
  }
}