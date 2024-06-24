import express from "express";
import fs from "fs";

const app = express();
const port = 3000;


// Set up view engine
app.set("view engine", "ejs");

//Somewhere in between, there was an issue with the content-type for JS, so this is just to set any extension for JS to text/javascript.

app.use(express.static('public', {
  setHeaders: (res, path, stat) => {
    if (path.endsWith('.js')) {
      res.set('Content-Type', 'text/javascript');
    }
  }
}));

//since body-parser is depreciated, using express.js instead.

app.use(express.json());
app.use(express.urlencoded({ extended: true }));



// Load existing posts from data.json if it exists, or initialize as an empty array
let postsArray = [];

if (fs.existsSync("data.json")) {
  const data = fs.readFileSync("data.json");
  postsArray = JSON.parse(data);
}

// Function to generate ID for new posts
const generateId = () => {
  // Find the maximum ID currently in the posts array.
  const maxId = postsArray.reduce((max, post) => Math.max(max, post.id), 0);
  // Increment the maximum ID to generate a new unique ID and also if id = 0, to add +1.
  return maxId === 0 ? 1 : maxId + 1;
};

// Routes

app.get("/", (req, res) => {
  res.render("index.ejs", { posts: postsArray });
});

app.get("/about", (req, res) => {
  res.render("about.ejs");
});

app.get("/compose", (req, res) => {
  res.render("compose.ejs");
});


app.post("/compose", (req, res) => {
  const newpostTitle = req.body.postTitle;
  const newPostContent = req.body.postContent;
  var currentDate = new Date().toLocaleString();

  const newPostData = {
    id: generateId(), // Generate unique ID for the new post
    date: currentDate,
    title: newpostTitle,
    content: newPostContent,
  };

  // Append new post to the existing array
  postsArray.push(newPostData);
  
  // Write the updated array to data.json
  fs.writeFileSync("data.json", JSON.stringify(postsArray));

  console.log("Successfully Published");
  res.redirect("/");
});

// Dynamic route to display an individual post
app.get("/post/:postId", (req, res) => {
  const postId = parseInt(req.params.postId);
  const post = postsArray.find(post => post.id === postId); // Find the post with the given ID
  if (post) {
    res.render("post.ejs", { post: post });
  } else {
    res.status(404).send("Post not found");
  }
});

// Add GET and POST route for editing individual posts

app.get("/edit/:postId", (req, res) => {
  const postId = parseInt(req.params.postId);
  const post = postsArray.find(post => post.id === postId); // Find the post with the given ID
  if (post) {
    res.render("edit.ejs", { post: post });
  } else {
    res.status(404).send("Post not found");
  }
});

app.post("/edit/:postId", (req, res) => {
  const postId = parseInt(req.params.postId);
  const { postTitle, postContent } = req.body;

  const index = postsArray.findIndex(post => post.id === postId);
  if (index !== -1) {
    postsArray[index].title = postTitle;
    postsArray[index].content = postContent;

    // Update data.json
    fs.writeFileSync("data.json", JSON.stringify(postsArray));

    res.redirect(`/post/${postId}`);
  } else {
    res.status(404).send("Post not found");
  }
});

//Manage the delete route

app.post("/delete/:postId", (req, res) => {
  const postId = parseInt(req.params.postId);

  // Find the index of the post with the given ID
  const index = postsArray.findIndex(post => post.id === postId);
  if (index !== -1) {
    // Remove the post from the array
    postsArray.splice(index, 1);

    // Update data.json
    fs.writeFileSync("data.json", JSON.stringify(postsArray));

    res.redirect("/");
  } else {
    res.status(404).send("Post not found");
  }
});
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});