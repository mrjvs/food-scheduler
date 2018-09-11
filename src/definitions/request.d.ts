declare namespace Express {
    export interface Request {
       isLoggedIn?: boolean;
       user?: object;
    }
 }