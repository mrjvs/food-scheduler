import Mongoose from "mongoose";
import { User as UserModel, IUserModel } from "../models/user";
const connectionString: string = process.env.DB_STRING  || "";

if (connectionString === "") {
    throw new Error("No connectionString plz fix");
}

let Connection: Mongoose.Connection = new Mongoose.Connection(Mongoose);
export const init = () => {
    Mongoose.connect(connectionString);
    Connection = Mongoose.connection;
    Connection.on("error", console.error.bind(console, "connection error:"));
};

export default Connection;
