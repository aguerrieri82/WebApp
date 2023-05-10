import express from "express"

const app = express(); 
app.use(express.static("./public"));
app.use("/src", express.static("./src"));
app.listen($(port));