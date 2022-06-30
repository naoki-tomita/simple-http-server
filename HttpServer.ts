import { HttpRequest, HttpRequestFactory } from "./HttpRequest.ts";
import { HttpStatus } from "./HttpResponse.ts";
import { HttpResponse } from "./HttpResponse.ts";

type Middleware = (
  request: HttpRequest,
  response: HttpResponse,
) => Promise<HttpResponse> | HttpResponse;

export class HttpServer {
  middlewares: Middleware[] = [];
  use(middleware: Middleware) {
    this.middlewares.push(middleware);
    return this;
  }

  async listen(port = 8000) {
    const listener = Deno.listen({ port });
    for await (const connection of listener) {
      this.parseRequest(connection).then(async (request) => {
        let response = new HttpResponse()
          .setStatus(HttpStatus.Ok);
        try {
          for (const middleware of this.middlewares) {
            response = await middleware(request, response);
          }
        } catch (e) {
          console.error(e);
          response.setStatus(HttpStatus.InternalServerError);
          response.setBody(e.message || "internal server error");
        }
        // 7 byte ???
        response.setHeader(
          "content-length",
          // deno-lint-ignore no-explicit-any
          (new TextEncoder().encode((response as any).body).byteLength - 7)
            .toString(),
        );
        if (request.headers["connection"] !== "keep-alive") {
          response.setHeader("connection", "close");
        }
        await connection.write(new TextEncoder().encode(response.toString()));
        connection.close();
      });
    }
  }

  private async parseRequest(connection: Deno.Conn): Promise<HttpRequest> {
    const buffer = new Uint8Array(32);
    let chunks = new Uint8Array(0);
    let n: number;

    while ((n = await connection.read(buffer) ?? 0) > 0) {
      chunks = new Uint8Array([...chunks, ...buffer.subarray(0, n)]);
      const req = new HttpRequestFactory().build(chunks);
      if (req != null) {
        return req;
      }
    }
    throw Error("unexpected end of request");
  }
}
