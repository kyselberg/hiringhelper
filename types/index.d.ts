declare module '~/server/models/user.model' {
  export interface IUser {
    _id?: string;
    email: string;
    password: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
  }

  export class UserModel {
    static create(userData: Omit<IUser, '_id' | 'createdAt' | 'updatedAt'>): Promise<IUser>;
    static findByEmail(email: string): Promise<IUser | null>;
    static findById(id: string): Promise<IUser | null>;
    static update(id: string, updateData: Partial<Omit<IUser, '_id' | 'createdAt' | 'updatedAt'>>): Promise<IUser | null>;
    static comparePassword(user: IUser, candidatePassword: string): Promise<boolean>;
  }
}

declare module '~/server/utils/auth' {
  export interface JWTPayload {
    userId: string;
    email: string;
  }

  export function generateToken(payload: JWTPayload): string;
  export function verifyToken(token: string): JWTPayload;
  export function setAuthCookie(event: any, token: string): void;
  export function removeAuthCookie(event: any): void;
  export function getAuthCookie(event: any): string | undefined;
  export function requireAuth(event: any): Promise<JWTPayload>;
}