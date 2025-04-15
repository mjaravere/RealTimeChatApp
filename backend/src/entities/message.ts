export class Message {
    user: string;
    text: string;
    timestamp: string;

    constructor(user: string, text: string, timestamp?: string) {
        this.user = user;
        this.text = text;
        this.timestamp = timestamp || new Date().toISOString();
    }
}