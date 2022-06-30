export class HttpRequest {
  constructor(
    readonly method: string,
    readonly url: string,
    readonly headers: { [key: string]: string },
    // deno-lint-ignore no-explicit-any
    readonly body?: any,
  ) {}
}

export class HttpRequestFactory {
  static Splitter = "\r\n";
  parseRequestLine(headLine: string) {
    const [method, path, version] = headLine.split(" ");
    return {
      method,
      path,
      version,
    };
  }

  parseHeaders(headers: string) {
    return headers
      .split(HttpRequestFactory.Splitter)
      .map((it) => it.split(":").map((it) => it.trim()))
      .reduce(
        (acc, [key, value]) => ({ ...acc, [key.toLowerCase()]: value }),
        {} as { [key: string]: string },
      );
  }

  parseBody(body: Uint8Array, contentType: string) {
    if (contentType === "application/json") {
      return JSON.parse(new TextDecoder().decode(body));
    }
    if (contentType === "application/x-www-form-urlencoded") {
      return new TextDecoder()
        .decode(body)
        .split("&")
        .map((it) => it.split("="))
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
    }
    return body;
  }

  // https://triple-underscore.github.io/rfc-others/RFC2616-ja.html
  build(data: Uint8Array): HttpRequest | undefined {
    const text = new TextDecoder().decode(data);
    const endOfHeaderIndex = text.indexOf(
      `${HttpRequestFactory.Splitter}${HttpRequestFactory.Splitter}`,
    );
    const endOfHeadIndex = text.indexOf(HttpRequestFactory.Splitter) +
      HttpRequestFactory.Splitter.length;
    if (endOfHeaderIndex === -1) {
      return undefined;
    }
    const { method, path } = this.parseRequestLine(
      text.split(HttpRequestFactory.Splitter)[0] ?? "",
    );
    const header = this.parseHeaders(
      text.slice(endOfHeadIndex, endOfHeaderIndex),
    );
    const contentLength = parseInt(header["content-length"] ?? "0", 10);
    const rawBody = data.slice(
      endOfHeaderIndex + HttpRequestFactory.Splitter.length * 2,
    );
    if (rawBody.byteLength < contentLength) {
      return undefined;
    }
    const body = this.parseBody(rawBody, header["content-type"] ?? "");

    return new HttpRequest(method, path, header, body);
  }
}
