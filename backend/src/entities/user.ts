export class User{
    username: string;
    createdAt: string;

    constructor(username: string) {
        this.username = username;
        this.createdAt = new Date().toISOString();
    }
}