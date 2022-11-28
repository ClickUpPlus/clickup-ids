// Super simple API wrapper, just what we want tho :)

export class ClickUp {
    token: string;

    constructor(token: string) {
        this.token = token;
    }

    async get(url: string) {
        const resp = await fetch(`https://api.clickup.com/api/v2${url}`, {
            method: 'GET',
            headers: {
                Authorization: this.token
            }
        });

        return await resp.json();
    }

    async getSelf(): Promise<any> {
        return await this.get('/user');
    }

    async getWorkspaces(): Promise<any> {
        return await this.get('/team');
    }

    async getSpaces(workspace: string): Promise<any> {
        return await this.get(`/team/${workspace}/space`);
    }

    async getLists(space: string): Promise<any> {
        return await this.get(`/space/${space}/list`);
    }

    async getFolders(space: string): Promise<any> {
        return await this.get(`/space/${space}/folder`);
    }

    async getTasks(list: string): Promise<any> {
        return await this.get(`/list/${list}/task`);
    }
}
