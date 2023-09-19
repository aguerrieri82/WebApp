import express from "express"
import { stdout } from "process"
/*HTTPS:import https from "https";
import fs from "fs";*/
/*proxy-port:import proxy from "express-http-proxy";*/

const app = express();
app.use(express.static("./public"));
app.use("/src", express.static("./src"));
/*HTTPS:
var privateKey = fs.readFileSync('localhost-key.pem', 'utf8');
var certificate = fs.readFileSync('localhost.pem', 'utf8');
var credentials = { key: privateKey, cert: certificate };
*/
/*proxy-port:
app.use('/api/*', proxy("http://localhost:$(proxy-port)", {
    proxyReqPathResolver: req => url.parse(req.baseUrl).path
}));
*/

app.use((request, response, next) => {

    response.sendFile(path.resolve("./public/index.html"));
});

stdout.write("\n\x1b[1mListening at \x1b[0m\x1b[36mhttp://localhost:$(port)/\x1b[0m\n");
/*HTTPS:
var httpsServer = https.createServer(credentials, app);
httpsServer.listen($(port));
*/
/*HTTP:
app.listen($(port));
*/