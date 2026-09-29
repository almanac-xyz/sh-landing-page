const express = require("express");
const app = express();
const port = 3001;

const path = require("path");

const hostname = "127.0.0.1";
const projectRoot = path.join(__dirname, "..");

app.use("/css", express.static(path.join(projectRoot, "css")));
app.use("/img", express.static(path.join(projectRoot, "img")));
app.get("/js/script.js", (req, res) => {
  res.sendFile(path.join(__dirname, "script.js"));
});

app.get("/", (req, res) => {
  res.sendFile(path.join(projectRoot, "index.html"));
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://${hostname}:${port}/`);
});
