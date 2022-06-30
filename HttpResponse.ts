export class HttpStatus {
  static Ok = new HttpStatus(200, "OK");
  static NotFound = new HttpStatus(404, "Not Found");
  static BadRequest = new HttpStatus(400, "Bad Request");
  static InternalServerError = new HttpStatus(500, "Internal Server Error");

  private constructor(readonly code: number, readonly text: string) {}
  from(code: number): HttpStatus | undefined {
    return Object.values(HttpStatus).find(status => status.code === code);
  }
}

export class HttpResponse {
  private status: HttpStatus = HttpStatus.Ok;
  private headers: { [key: string]: string; } = {
    "content-type": "text/plain",
  };
  private body = "";

  constructor() {}

  setStatus(status: HttpStatus) {
    this.status = status;
    return this;
  }

  setHeader(key: string, value: string) {
    this.headers[key.toLowerCase()] = value;
    return this;
  }

  setBody(body: string) {
    this.body = body;
    return this;
  }

  setJsonBody(body: {}) {
    this.setBody(JSON.stringify(body));
    this.setHeader("Content-Type", "application/json");
    return this;
  }

  toString() {
    return `
HTTP/1.1 ${this.status.code} ${this.status.text}
${Object.entries(this.headers).map(it => `${it[0]}: ${it[1]}`).join("\n")}

${this.body}
    `.trim();
  }
}
