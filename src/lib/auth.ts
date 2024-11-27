import { db, User, eq } from 'astro:db';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export async function createUser(name: string, email: string, password: string) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString('hex');

    const user = await db.insert(User).values({
        name:name,
        email:email,
        password: hashedPassword,
        verified_token:verificationToken,
        email_verified: false,
        createdAt: new Date()
    }).returning().get();

    return { user, verificationToken };
}

export async function verifyUser(token: string) {
    const user = await db
        .select()
        .from(User)
        .where(eq(User.verified_token, token))
        .get();

    if (!user) return null;

    await db
        .update(User)
        .set({
            email_verified: true,
            verified_token: null,
            updatedAt: new Date()
        })
        .where(eq(User.id, user.id));

    return user;
}

export async function authenticateUser(email: string, password: string) {
    const user = await db
        .select()
        .from(User)
        .where(eq(User.email, email))
        .get();

    if (!user) return null;

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return null;

    return user;
}

export async function createPasswordReset(email: string) {
    const user = await db
        .select()
        .from(User)
        .where(eq(User.email, email))
        .get();

    if (!user) return null;

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await db
        .update(User)
        .set({
            reset_token:resetToken,
            token_expiry:resetTokenExpiry,
            updatedAt: new Date()
        })
        .where(eq(User.id, user.id));

    return resetToken;
}

export async function resetPassword(token: string, newPassword: string) {
    const user = await db
        .select()
        .from(User)
        .where(eq(User.reset_token, token))
        .get();

    if (!user || !user.token_expiry || new Date() > user.token_expiry) {
        return null;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db
        .update(User)
        .set({
            password: hashedPassword,
            resetToken: null,
            resetTokenExpiry: null,
            updatedAt: new Date()
        })
        .where(eq(User.id, user.id));

    return user;
}

export const hashPassword = async (password: string): Promise<string> => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
};

export const comparePasswords = async (password: string, hashedPassword: string): Promise<boolean> => {
    return bcrypt.compare(password, hashedPassword);
};

export const generateUserId = (): string => {
    return crypto.randomUUID(); //uuidv4();
};