// Teehee I'm actually a html file, don't tell anyone

import { layout } from "./layout";

export function noAuth(client_id: string, redirect_uri: string) {
    let url = `https://app.clickup.com/api?client_id=${client_id}&redirect_uri=${redirect_uri}`;

    let body = `
    <p>Uh oh! You aren't signed in :(</p>
    <p>Click <a href="${url}">here</a> to authenticate with ClickUp.</p>
    `

    return layout(body);
}
