import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { Request, Response } from "express";
import cookieParser from "cookie-parser";
import Exphbs from "express-handlebars";

import AuthRouter from "./routes/api";
import * as DB from "./utils/db";
import * as userController from "./controllers/user";

// setup imports

const port: number = parseInt(process.env.WEBSERVER_PORT || "80", undefined);
const app: express.Application = express();
DB.init();
app.use(cookieParser());
app.use(express.urlencoded());
app.set("views", __dirname + "\\views");

const hbs = Exphbs({
    defaultLayout: "main",
    extname: ".hbs",
    partialsDir: app.get("views") + "\\partials",
    layoutsDir: app.get("views") + "\\layouts"
});

app.engine(".hbs", hbs);
app.set("view engine", ".hbs");

// setup public files
app.use(express.static(__dirname + "/public"));

// setup routes
app.post("/login", userController.login);
app.post("/register", userController.register);

app.get("/", (req: Request, res: Response) => {
    res.render("home", {title: "food scheduler"});
});
app.use("/api/v1", AuthRouter);

// startup server
// TODO move to env vars
app.listen(80);
console.log("Magic happens on port " + 80);
