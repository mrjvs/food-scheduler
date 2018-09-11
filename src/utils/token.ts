import crypto from "crypto";
import bcrypt from "bcrypt";
import { getRandomString } from "../models/user";

async function generateSecretToken(): Promise<string[]> {
    // generates token
    const newToken: string = getRandomString();

    // returns [hashedToken, plainToken]
    // secret token salt
    return [await bcrypt.hash(newToken, 5), newToken];
}

export default generateSecretToken;
