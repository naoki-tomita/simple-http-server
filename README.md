# simple-http-server

Denoで書かれたHTTPサーバーライブラリです。 ソケット接続をHTTPリクエストに変換し、レスポンスをソケット接続で返します。

## function

[Connect](https://github.com/senchalabs/connect)のようにMiddlewareを書くことで、HTTPサーバーを建てることができます。
useを複数書くことで、Middlewareを複数連結させることができます。

```ts
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
    console.log("end", Date.now(), req.method, req.url);
    return res;
  })
  .listen(8000);
```
