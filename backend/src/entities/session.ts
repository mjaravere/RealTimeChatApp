import { User } from "./user";
import { Message } from "./message";

export class Session {
    messages: Message[] = [];
    users: Map<string, User> = new Map();
    connectedClients: number = 0;

    constructor() {
        this.messages = [];
        this.users = new Map();
        this.connectedClients = 0;
    }
}