/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `wrangler dev src/index.ts` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `wrangler publish src/index.ts --name my-worker` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */
import {noAuth} from "./no-auth";
import {handleAuth} from "./callback";
import {ClickUp} from "./clickup";
import {decrypt, encrypt } from "./crypto";

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

                console.log(key);

                // get self
                const api = new ClickUp(key);
                const self = await api.getSelf();
                return new Response(`Hello ${self['user']['username']}!`);
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
                        "Set-Cookie": `token=${token} Max-Age=86400; Path=/;`,
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
