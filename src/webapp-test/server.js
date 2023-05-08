import express from "express"

const app = express(); 
app.use(express.static("./public"));
app.use("/src", express.static("./src"));
app.use("/webapp-core", express.static("../webapp-core"));
app.use("/webapp-jsx", express.static("../webapp-jsx"));
app.use("/webapp-ui", express.static("../webapp-ui"));
app.listen(4000);