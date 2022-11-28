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

export function buildCards(data: any[], showing: string, params: URLSearchParams) {
    let childHref = "";
    if (showing === "workspace") {
        // We're showing workspaces, so we need to link to spaces
    } else {
        childHref = "?workspace=" + params.get("workspace");
        for (let [key, value] of params) {
            if (key !== "workspace") {
                childHref += `&${key}=${value}`;
            }
        }
    }

    const cards = data.map(data => {
        let children = "";
        if (showing != "task") {
            children = `
            <div class="card-footer">
                <a href="${childHref}${showing == "workspace" ? "?" : "&"}${showing}=${data.id}" class="btn btn-primary">
                    View children
                </a>
            </div>
            `;
        }

        return `
    <div class="col-12 col-md-6 col-lg-4 col-xl-3">
        <div class="card">
            <div class="card-body">
                <h2>${data.name}</h2>
                <p>ID: <code>${data.id}</code></p>
           </div>
           ${children}
        </div>
    </div>
    `}).join('');

    return `
    <div class="row">
    ${cards}
    </div>
    `;
}
