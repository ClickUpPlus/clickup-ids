/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `wrangler dev src/index.ts` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `wrangler publish src/index.ts --name my-worker` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */
import {buildCards, noAuth} from "./views";
import {handleAuth} from "./callback";
import {ClickUp} from "./clickup";
import {decrypt, encrypt } from "./crypto";
import {layout} from "./layout";

export interface Env {
    CLICKUP_CLIENT_ID: string;
    CLICKUP_CLIENT_SECRET: string;
    CLICKUP_REDIRECT_URI: string;
}

export default {
    async fetch(
        request: Request,
        env: Env,
        ctx: ExecutionContext
    ): Promise<Response> {
        const path = new URL(request.url).pathname;
        switch (path) {
            case "/": {
                // Check to see if "auth" cookie is set
                let auth = request.headers.get("Cookie")?.match(/token=([^;]+)/)?.[1];
                if (!auth) {
                    return new Response(noAuth(env.CLICKUP_CLIENT_ID, env.CLICKUP_REDIRECT_URI), {
                        headers: {
                            "Content-Type": "text/html",
                        },
                    })
                }

                const key = await decrypt(auth, env.CLICKUP_CLIENT_SECRET);

                // get self
                const api = new ClickUp(key);

                // let's get all the info!!!
                // Parse out the params we have
                const params = new URL(request.url).searchParams;
                // If no workspace, get all workspaces
                let data: any[] = [];
                let showing = "";
                if (!params.has("workspace")) {
                    data = (await api.getWorkspaces())['teams'];
                    showing = "workspace";
                } else if (!params.has("space")) {
                    data = (await api.getSpaces(params.get("workspace")!))['spaces'];
                    showing = "space";
                } else if (!params.has("list")) {
                    data = (await api.getLists(params.get("space")!))['lists'];
                    showing = "list";
                } else {
                    data = (await api.getTasks(params.get("list")!))['tasks'];
                    showing = "task";
                }

                let upUrl = "";
                // build the up url, which is all params minus the last one
                for (const [key, value] of params) {
                    if (key !== showing) {
                        upUrl += `&${key}=${value}`;
                    }
                }
                // remove the last & and everything after it
                upUrl = upUrl.replace(/&[^&]+$/, "");
                // replace first & with ?
                upUrl = upUrl.replace("&", "?");
                // if upUrl is blank, set it to /
                if (upUrl === "") {
                    upUrl = "/";
                }

                const cards = buildCards(data, showing, params);
                const show = `<h2>Showing ${showing}s</h2><a href="${upUrl}">Go Up</a>${cards}`;

                return new Response(layout(show), {
                    headers: {
                        "Content-Type": "text/html",
                    }
                });
            }
            case "/callback": {
                // Handle callback
                const code = new URL(request.url).searchParams.get("code");
                if (!code) {
                    return new Response("No code provided", {status: 400});
                }

                const res = await handleAuth(env.CLICKUP_CLIENT_ID, env.CLICKUP_CLIENT_SECRET, code);

                // Encrypt it with a secret
                const token = await encrypt(res, env.CLICKUP_CLIENT_SECRET);

                // If successful, add auth cookie, and redirect to /
                return new Response("Success!", {
                    headers: {
                        "Set-Cookie": `token=${token}; Max-Age=86400; Path=/;`,
                        "Location": "/",
                    },
                    status: 302,
                });
            }
            default: {
                return new Response("Not found", {status: 404});
            }
        }
    },
};
