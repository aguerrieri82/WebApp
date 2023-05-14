import express from "express"
import { stdout } from "process"

const app = express();
app.use(express.static("./public"));
app.use("/src", express.static("./src"));

stdout.write("\n\x1b[1mListening at \x1b[0m\x1b[36mhttp://localhost:$(port)/\x1b[0m\n");

app.listen($(port));