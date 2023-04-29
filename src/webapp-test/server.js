import express from "express"

const app = express(); 
app.use(express.static("./public"));
app.use(express.static("./"));
app.listen(4000);