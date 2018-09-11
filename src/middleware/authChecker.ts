import { NextFunction, Request, Response } from "express";
import { User, IUser } from "../models/user";
import crypto from "crypto";
import bcrypt from "bcrypt";
import generateSecretToken from "../utils/token";

// TODO move to env vars
const cookieNameToken: string = process.env.AUTHERISATION_COOKIE_LOGIN_TOKEN_NAME  || "";
const cookieNameId: string = process.env.AUTHERISATION_COOKIE_SESSIONID_NAME  || "";
const cookieName: string = process.env.AUTHERISATION_COOKIE_NAME || "";
const secretTokenSecret: string = process.env.AUTHERISATION_COOKIE_LOGIN_TOKEN_SECRET || "";

function isLoggedIn(req: Request, res: Response, next: NextFunction): void {

    // TODO this shit dont work. fix it plz

    const authCookie = req.cookies[cookieName];
    // check if cookie is correct.
    if (!authCookie || !authCookie[cookieNameToken] && !authCookie[cookieNameId]) {
        console.log("cookie not foudn or correct");
        req.isLoggedIn = false;
        next();
        return;
    }

    console.log(authCookie);

    // find user by session id stored in cookie
    User.findBySessionId(authCookie[cookieNameId]).then((authInfo: IUser | null): void => {
        if (!authInfo) {
            // user does not exist
            console.log("user not found");
            req.isLoggedIn = false;
            next();
            return;
        }

        // TODO move crypto to utils/token
        // TODO promise rejections
        // check if token is correct
        bcrypt.compare(authInfo.userSecret, authCookie[cookieNameToken], (err: Error, same: boolean) => {
            if (same) {
                console.log("cookie is valid");
                // token is correct, updating token
                generateSecretToken().then((secretTokenArray) => {
                    User.updateToken(authInfo.sessionId, secretTokenArray[1]).then(() => {
                        const authCookieNew: any = new Object();
                        authCookieNew[cookieNameToken] = secretTokenArray[0];
                        authCookieNew[cookieNameId] = authCookie[cookieNameId];
                        res.clearCookie(cookieName);
                        res.cookie(cookieName, authCookieNew);
                        // set user in request
                        req.isLoggedIn = true;
                        req.user = authInfo;
                        next();
                        return;
                    });
                }).catch((rejection: any) => {
                    console.log("token rejection ???");
                    req.isLoggedIn = false;
                    next();
                    return;
                });
            } else {
                // token incorrect, assumed theft: reset sessionid and token
                // TODO wipe data / assumed theft
                console.log("FAULTY LOGIN");
                req.isLoggedIn = false;
                next();
                return;
            }
        });
    });
}

export default isLoggedIn;
