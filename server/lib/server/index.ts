import http, { IncomingMessage, ServerResponse } from "http";
import fs from "fs";
import path from "path";
import multiparty from "multiparty";
import __dir from "../../dir";

type Req = IncomingMessage;
export interface Request extends Req {
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
export interface Response extends Res {
  json: (data: object) => void;
  status: (code: number) => Response;
}
function $Respone(response: Res) {
  const res: Response = response as any;
  res.json = json;
  res.status = status;
  return res;
}
function json(data: object) {
  (this as Response).setHeader("Content-Type", "application/json");
  (this as Response).end(JSON.stringify(data));
}
function status(code: number) {
  (this as Response).statusCode = code;
  return this;
}

let staticFolder = "";
const routes = [];

type func = (url: string, ...cb: ((req: Request, res: Response, next?: () => void) => void)[]) => void;
type init = (req: IncomingMessage, res: ServerResponse<IncomingMessage> & { req: IncomingMessage }) => void;

export interface IServer extends http.Server<typeof http.IncomingMessage, typeof http.ServerResponse> {
  get: func;
  post: func;
  put: func;
  delete: func;
  static: (folder: string) => void;
  use: (url: string, route: IRouter) => void;
}

function server() {
  const server: IServer = http.createServer(init) as any;
  server.get = (url, ...cb) => addRoute(url, cb);
  server.post = (url, ...cb) => addRoute(url, cb, "POST");
  server.put = (url, ...cb) => addRoute(url, cb, "PUT");
  server.delete = (url, ...cb) => addRoute(url, cb, "DELETE");
  server.static = (name) => (staticFolder = name);
  server.use = use;
  return server;
}

function addRoute(url: string, cb: ((req: Request, res: Response) => void)[], method: "GET" | "POST" | "PUT" | "DELETE" = "GET") {
  routes.push({ url: url.split("/"), cb, method });
}
function checkRoute(url: string, method: string) {
  const [paramsUrl, queryUrl] = url.split("?");
  const paramsSplit = paramsUrl.split("/");
  const params = {};
  const query = {};
  const route = routes.find((i) => {
    if (i.method !== method) return false;
    for (let n = 0; n < paramsSplit.length; n++) {
      if (i.url[n] !== undefined) {
        if (i.url[n][0] !== ":") {
          if (paramsSplit[n] !== i.url[n]) return false;
        } else params[i.url[n].substring(1)] = paramsSplit[n];
      } else return false;
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
function use(url: string, route: IRouter) {
  for (const i of route.store) {
    i[0] = url + i[0];
    addRoute(...i);
  }
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
          const readStream = fs.createReadStream(filePath);
          return readStream.pipe(response);
        } else return response.end(`NOT STATIC ${request.url} ${request.method}`);
      }
    return response.end(`NOT FOUND ${request.url} ${request.method}`);
  }
  const contentType = request.headers["content-type"];
  let body: any = "";
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
    request.on("end", async () => {
      if (contentType === "application/json") body = JSON.parse(body as string);
      $route();
    });
  }
  async function $route() {
    const req = $Request(request, { params, query, body, files });
    const res = $Respone(response);
    let next = false;
    for (let i = 0; i < route.cb.length; i++) {
      const cb = route.cb[i];
      if (!i || next)
        await cb(req, res, () => {
          next = true;
        });
    }
  }
}

interface IRouter {
  store: [url: string, cb: ((req: Request, res: Response) => void)[], method: "GET" | "POST" | "PUT" | "DELETE"][];
  get: func;
  post: func;
  put: func;
  delete: func;
}
export function Router() {
  const router: IRouter = {
    store: [],
    get(url, ...cb) {
      this.store.push([url, cb]);
    },
    post(url, ...cb) {
      this.store.push([url, cb, "POST"]);
    },
    put(url, ...cb) {
      this.store.push([url, cb, "PUT"]);
    },
    delete(url, ...cb) {
      this.store.push([url, cb, "DELETE"]);
    },
  };

  return router;
}

export default server;
