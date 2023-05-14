import express from "express"
import path from "path"

const app = express();

app.use(express.static("./public"));

app.use((request, response, next) => {

    response.sendFile(path.resolve("./public/index.html"));
});

app.listen(4000);