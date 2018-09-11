import crypto from "crypto";
import bcrypt from "bcrypt";
import { getRandomString } from "../models/user";

// TODO move secret to env vars
const secretTokenSalt: number = 5;

async function generateSecretToken(): Promise<string[]> {
    // generates token
    const newToken: string = getRandomString();

    // returns [hashedToken, plainToken]
    return [await bcrypt.hash(newToken, secretTokenSalt), newToken];
}

export default generateSecretToken;
