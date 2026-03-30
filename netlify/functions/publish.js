exports.handler = async (event) => {
  try {
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const OWNER = "akymsco";
    const REPO = "lgportal";
    const BASE_PATH = "myproject/blog/news";

    // ======================
    // PARSE DATA
    // ======================
    const data = JSON.parse(event.body || "{}");

    if (!data.title || !data.content) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing title or content" })
      };
    }

    // ======================
    // CREATE SLUG
    // ======================
    const slug = data.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    // ======================
    // POST DATA
    // ======================
    const postData = {
      title: data.title,
      content: data.content,
      image: data.image || "",
      date: new Date().toISOString(),
      slug
    };

    // ======================
    // GET index.json
    // ======================
    const indexRes = await fetch(
      `https://api.github.com/repos/${OWNER}/${REPO}/contents/${BASE_PATH}/index.json`,
      {
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          "User-Agent": "netlify-function"
        }
      }
    );

    if (!indexRes.ok) {
      const errText = await indexRes.text();
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: "Failed to fetch index.json",
          details: errText
        })
      };
    }

    const indexFile = await indexRes.json();

    let indexContent = [];

    if (indexFile.content) {
      indexContent = JSON.parse(
        Buffer.from(indexFile.content, "base64").toString()
      );
    }

    // ======================
    // ADD POST
    // ======================
    indexContent.push({
      title: postData.title,
      slug,
      date: postData.date,
      image: postData.image
    });

    // ======================
    // UPDATE index.json
    // ======================
    const updateIndex = await fetch(
      `https://api.github.com/repos/${OWNER}/${REPO}/contents/${BASE_PATH}/index.json`,
      {
        method: "PUT",
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          "Content-Type": "application/json",
          "User-Agent": "netlify-function"
        },
        body: JSON.stringify({
          message: `Add post ${slug}`,
          content: Buffer.from(
            JSON.stringify(indexContent, null, 2)
          ).toString("base64"),
          sha: indexFile.sha
        })
      }
    );

    if (!updateIndex.ok) {
      const errText = await updateIndex.text();
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: "Failed to update index.json",
          details: errText
        })
      };
    }

    // ======================
    // CREATE POST FILE
    // ======================
    const createPost = await fetch(
      `https://api.github.com/repos/${OWNER}/${REPO}/contents/${BASE_PATH}/${slug}.json`,
      {
        method: "PUT",
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          "Content-Type": "application/json",
          "User-Agent": "netlify-function"
        },
        body: JSON.stringify({
          message: `Create post ${slug}`,
          content: Buffer.from(
            JSON.stringify(postData, null, 2)
          ).toString("base64")
        })
      }
    );

    if (!createPost.ok) {
      const errText = await createPost.text();
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: "Failed to create post file",
          details: errText
        })
      };
    }

    // ======================
    // SUCCESS
    // ======================
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        slug
      })
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: err.message
      })
    };
  }
};