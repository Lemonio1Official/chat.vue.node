import http, { IncomingMessage, ServerResponse } from "http";
import fs from "fs";
import path from "path";
import multiparty from "multiparty";
import __dir from "../dir";

type Req = IncomingMessage;
interface Request extends Req {
  params: Record<string, string>;
  query: Record<string, string>;
  body: any;
  files: Record<string, File>;
}
function $Request(request: Req, data: { [key: string]: any }) {
  const req: Request = request as any;
  for (const k of Object.keys(data)) {
    req[k] = data[k];
  }
  return req;
}
type Res = ServerResponse<IncomingMessage> & { req: IncomingMessage };
interface Response extends Res {
  json: (data: object) => void;
}
function $Respone(response: Res) {
  const res: Response = response as any;
  res.json = json;
  return res;
}

function json(data: object) {
  const res: Response = this;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(data));
}

let staticFolder = "";
const routes = [];

type func = (url: string, cb: (req: Request, res: Response) => void) => void;
type init = (req: IncomingMessage, res: ServerResponse<IncomingMessage> & { req: IncomingMessage }) => void;

interface IServer extends http.Server<typeof http.IncomingMessage, typeof http.ServerResponse> {
  get: func;
  post: func;
  put: func;
  delete: func;
  static: (folder: string) => void;
}

function server() {
  const server: IServer = http.createServer(init) as any;
  server.get = (url, cb) => addRoute(url, cb);
  server.post = (url, cb) => addRoute(url, cb, "POST");
  server.put = (url, cb) => addRoute(url, cb, "PUT");
  server.delete = (url, cb) => addRoute(url, cb, "DELETE");
  server.static = (name) => (staticFolder = name);
  return server;
}

function addRoute(url: string, cb: (req: Request, res: Response) => void, method: "GET" | "POST" | "PUT" | "DELETE" = "GET") {
  routes.push({ url: url.split("/"), cb, method });
}

function checkRoute(url: string, method: string) {
  const [paramsUrl, queryUrl] = url.split("?");
  const paramsSplit = paramsUrl.split("/");
  const params = {};
  const query = {};
  const route = routes.find((i) => {
    if (i.method !== method) return false;
    for (let n = 0; n < paramsUrl.length; n++) {
      if (i.url[n] || i.url[n] === "")
        if (i.url[n][0] !== ":") {
          if (paramsSplit[n] !== i.url[n]) return false;
        } else params[i.url[n].substring(1)] = paramsSplit[n];
      else return false;
    }
    return true;
  });
  if (queryUrl)
    for (const i of queryUrl.split("&")) {
      const [k, v] = i.split("=");
      query[k] = v;
    }
  return { route, params, query };
}

function m2n(fields: Record<string, [any]>) {
  const body = {};
  for (const k of Object.keys(fields)) {
    body[k] = fields[k][0];
  }
  return body;
}

function init(request: IncomingMessage, response: ServerResponse<IncomingMessage> & { req: IncomingMessage }) {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  response.setHeader("Access-Control-Allow-Headers", "*");
  const { route, params, query } = checkRoute(request.url, request.method);
  if (!route) {
    const urlSplit = request.url.split("/");
    if (urlSplit.length === 2)
      if (staticFolder && fs.existsSync(path.join(__dir, staticFolder))) {
        const filePath = path.join(__dir, staticFolder, urlSplit[1]);
        if (fs.existsSync(filePath)) {
          console.log(filePath);
          const readStream = fs.createReadStream(filePath);
          return readStream.pipe(response);
        } else return response.end(`NOT STATIC ${request.url} ${request.method}`);
      }
    return response.end(`NOT FOUND ${request.url} ${request.method}`);
  }
  const contentType = request.headers["content-type"];
  let body: any = {};
  let files: any = {};
  if (contentType && contentType.indexOf("multipart") === 0) {
    new multiparty.Form().parse(request, (err, fields, files_) => {
      if (err) return console.log(err);
      body = m2n(fields);
      files = m2n(files_);
      $route();
    });
  } else {
    request.on("data", (chunk) => {
      body += chunk;
    });
    request.on("end", () => {
      if (request.headers["content-type"] === "application/json") body = JSON.parse(body as string);
      $route();
    });
  }
  function $route() {
    const req = $Request(request, { params, query, body, files });
    const res = $Respone(response);
    route.cb(req, res);
  }
}

export default server;
