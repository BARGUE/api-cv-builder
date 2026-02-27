import { Injectable } from '@nestjs/common';

export type User = {
    id: number;
    email: string;
    passwordHash: string;
};

@Injectable()
export class UsersService {
    private users: User[] = [];
    private idSeq = 1;

    async findByEmail(email: string) {
        return this.users.find(u => u.email === email);
    }

    async create(email: string, passwordHash: string) {
        const user: User = { id: this.idSeq++, email, passwordHash };
        this.users.push(user);
        return user;
    }
}
