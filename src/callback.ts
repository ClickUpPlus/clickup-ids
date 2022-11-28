// Handles callback

export async function handleAuth(client_id: string, client_secret: string, code: string) {
    const query = new URLSearchParams({
        client_id: client_id,
        client_secret: client_secret,
        code: code
    }).toString();

    const resp = await fetch(
        `https://api.clickup.com/api/v2/oauth/token?${query}`,
        {method: 'POST'}
    );

    const data: any = await resp.json();
    console.log(data);
    return data.access_token;
}
