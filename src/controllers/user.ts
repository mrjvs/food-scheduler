import generateSecretToken from "../utils/token";
import bcrypt from "bcrypt";
import { Request, Response, NextFunction } from "express";
import { User, IUser, getRandomString } from "../models/user";
import HttpStatusCode from "../definitions/HttpStatusCodes";

// TODO move to env vars
const cookieNameToken: string = "af987jcf";
const cookieNameId: string = "bsje89dj";
const cookieName: string = "food-scheduler";

/* ****************************
 *  authentication opun login:
 *  - login cookie added
 *  - contains id and token (hashed)
 *  - when user accesses an endpoint:
 *  1. if login cookie exists and id and token matches the stored one new token is generated and
 *  placed in cookie/database.
 *  2. if login cookie exists and id matches and token doesnt. database/cookie id and token is wiped.
 *  3. if login cookie exists and doesnt contain an id or token. ignore and proceed to login screen.
 *  4. if login cookie doesnt exist. proceed to login screen.
 *******************************/

export function login(req: Request, res: Response): void {
    if (!req.body || !req.body.username || !req.body.password) {
        res.sendStatus(HttpStatusCode.BAD_REQUEST);
        return;
    }
    const { username, password } = req.body;

    // find user in db
    User.findByUsername(username).then((authInfo: IUser | null): void => {
        if (!authInfo) {
            // user does not exist
            res.sendStatus(HttpStatusCode.BAD_REQUEST);
            return;
        }

        // check if password is correct
        bcrypt.compare(password, authInfo.password, (err: any, result: boolean) => {
            if (err) {
                res.sendStatus(HttpStatusCode.BAD_REQUEST);
                return;
            }
            if (result) {
                // register auth cookie
                const authCookie: any = new Object();
                generateSecretToken().then((secretTokenArray) => {
                    authCookie[cookieNameId] = authInfo.sessionId;
                    authCookie[cookieNameToken] = secretTokenArray[0];
                    console.log(secretTokenArray);
                    User.updateToken(authInfo.sessionId, secretTokenArray[1]).then(() => {
                        res.cookie(cookieName, authCookie);
                        // successfull
                        res.statusCode = HttpStatusCode.OK;
                        User.findByUsername(authInfo.username).then((resu) => {
                            res.json(resu);
                        });
                    });
                }).catch((rejection: any) => {
                    res.sendStatus(HttpStatusCode.BAD_REQUEST);
                    return;
                });
            } else {
                // password incorrect
                // TODO better http code ???
                res.sendStatus(HttpStatusCode.BAD_REQUEST);
                return;
            }
        });
    });
}

export function register(req: Request, res: Response): void {

    if (!req.body || !req.body.username || !req.body.password) {
        // no/wrong post body
        res.sendStatus(HttpStatusCode.BAD_REQUEST);
        return;
    }
    const { username, password } = req.body;

    const newUser: IUser = new User({
        username,
        password
    });

    newUser.save().then(() => {
        // successfull
        res.sendStatus(HttpStatusCode.CREATED);
        return;
    }).catch((rejection: any) => {
        res.statusCode = HttpStatusCode.BAD_REQUEST;
        res.json(rejection);
        return;
    });
}
