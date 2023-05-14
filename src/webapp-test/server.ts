import * as express from "express"

const app = express(); 

app.use((request, response, next) => {
    next()
    request.url = "/";
    next();

});

app.listen(4000);