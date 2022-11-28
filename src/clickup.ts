// Super simple API wrapper, just what we want tho :)

export class ClickUp {
    token: string;

    constructor(token: string) {
        this.token = token;
    }

    async getSelf(): Promise<any> {
        const resp = await fetch(`https://api.clickup.com/api/v2/user`, {
            method: 'GET',
            headers: {
                Authorization: this.token
            }
        });

        return await resp.json();
    }
}
