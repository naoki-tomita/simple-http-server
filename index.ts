import { HttpServer, HttpStatus, Middleware } from "./deps.ts";

new HttpServer()
  .use((req, res) => {
    console.log("start", Date.now(), req.method, req.url);
    return res;
  })
  .use((req, res) => {
    res
      .setStatus(HttpStatus.Ok)
      .setHeader("Content-Type", "text/html")
      .setBody(`
        <html>
          <head>
            <meta charset="UTF-8">
          </head>
          <body>
            <h1>Hello world</h1>
            <p>${req.url}</p>
            <p>This server is made by deno.</p>
          </body>
        </html>
      `);
    return res;
  })
  .use((req, res) => {
    console.log("end", Date.now(), req.method, req.url, res.status.code);
    return res;
  })
  .listen(8000);
