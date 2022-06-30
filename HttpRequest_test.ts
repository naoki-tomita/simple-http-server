import { assertEquals } from "https://deno.land/std@0.145.0/testing/asserts.ts";

import { HttpRequestFactory } from "./HttpRequest.ts";

Deno.test("create HttpRequest no body", () => {
  const text = `
GET /foo/bar HTTP/1.1
Accept-Encoding: gzip, deflate
Connection: Keep-Alive

`.trimStart().split("\n").join("\r\n");
  const request = new HttpRequestFactory().build(
    new TextEncoder().encode(text),
  )!;
  assertEquals(request.method, "GET");
  assertEquals(request.url, "/foo/bar");
  assertEquals(request.headers, {
    "accept-encoding": "gzip, deflate",
    "connection": "Keep-Alive",
  });
});

Deno.test("create HttpRequest with body urlencoded", () => {
  const text = `
POST /post HTTP/1.1
Host: www.xxx.zzz
Content-Type: application/x-www-form-urlencoded
Content-Length: 17

this=is&body=test
`.trim().split("\n").join("\r\n");
  const request = new HttpRequestFactory().build(
    new TextEncoder().encode(text),
  )!;
  assertEquals(request.method, "POST");
  assertEquals(request.url, "/post");
  assertEquals(request.headers, {
    "host": "www.xxx.zzz",
    "content-type": "application/x-www-form-urlencoded",
    "content-length": "17",
  });
  assertEquals(request.body, { this: "is", body: "test" });
});

Deno.test("create HttpRequest with body json", () => {
  const text = `
POST /post HTTP/1.1
Host: www.xxx.zzz
Content-Type: application/json
Content-Length: 17

{ "string": "bar", "number": 12, "boolean": false, "null": null, "object": { "foo": "bar" }, "array": [1, 2, "3", true, null, "text"] }
`.trim().split("\n").join("\r\n");
  const request = new HttpRequestFactory().build(
    new TextEncoder().encode(text),
  )!;
  assertEquals(request.method, "POST");
  assertEquals(request.url, "/post");
  assertEquals(request.headers, {
    "host": "www.xxx.zzz",
    "content-type": "application/json",
    "content-length": "17",
  });
  assertEquals(request.body, {
    string: "bar",
    number: 12,
    boolean: false,
    null: null,
    object: {
      foo: "bar",
    },
    array: [1, 2, "3", true, null, "text"],
  });
});
