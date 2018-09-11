import { Router, Response, Request } from "express";
import authChecker from "../middleware/authChecker";

const authRouter: Router = Router();

// setup middleware
authRouter.use(authChecker);

authRouter.get("/check", (req: Request, res: Response) => {
    res.json({
        isloggedIn: req.isLoggedIn,
        user: req.user
    });
});

export default authRouter;
