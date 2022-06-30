export class HttpRequest {
  constructor(
    readonly method: string,
    readonly url: string,
    readonly headers: { [key: string]: string },
    readonly body?: {}
  ) {}

  static Splitter = "\r\n";

  static parseRequestLine(headLine: string) {
    const [method, path, version] = headLine.split(" ");
    return {
      method,
      path,
      version
    };
  }

  static parseHeaders(headers: string) {
    return headers
      .split(HttpRequest.Splitter)
      .map(it => it.split(":").map(it => it.trim()))
      .reduce((acc, [key, value]) => ({ ...acc, [key.toLowerCase()]: value }), {} as { [key: string]: string });
  }

  static parseBody(body: Uint8Array, contentType: string) {
    if (contentType === "application/json") {
      return JSON.parse(new TextDecoder().decode(body));
    }
    if (contentType === "application/x-www-form-urlencoded") {
      return new TextDecoder()
        .decode(body)
        .split("&")
        .map(it => it.split("="))
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
    }
    return body;
  }

  // https://triple-underscore.github.io/rfc-others/RFC2616-ja.html
  static from(data: Uint8Array): HttpRequest | undefined {
    const text = new TextDecoder().decode(data);
    const endOfHeaderIndex = text.indexOf(`${HttpRequest.Splitter}${HttpRequest.Splitter}`);
    const endOfHeadIndex = text.indexOf(HttpRequest.Splitter) + HttpRequest.Splitter.length;
    if (endOfHeaderIndex === -1) {
      return undefined;
    }
    const { method, path } = HttpRequest.parseRequestLine(text.split(HttpRequest.Splitter)[0] ?? "");
    const header = HttpRequest.parseHeaders(text.slice(endOfHeadIndex, endOfHeaderIndex));
    const contentLength = parseInt(header["content-length"] ?? "0", 10);
    const rawBody = data.slice(endOfHeaderIndex + HttpRequest.Splitter.length * 2);
    if (rawBody.byteLength < contentLength) {
      return undefined;
    }
    const body = HttpRequest.parseBody(rawBody, header["content-type"] ?? "");

    return new HttpRequest(method, path, header, body);
  }
}
