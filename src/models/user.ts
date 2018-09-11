import { Document, Schema, Model, model } from "mongoose";
import uniqueValidator from "mongoose-unique-validator";
import bcrypt from "bcrypt";
import crypto from "crypto";

const secretTokenSize: number = parseInt(process.env.SECRET_TOKEN_SIZE || "0", undefined);

export interface IUserDocument extends Document {
    username: string;
    password: string;
    sessionId: string;
    userSecret: string;
}

// instanced usermodel methods
export interface IUser extends IUserDocument {
    removeSecretInfo(): object;
}

// static usermodel methods
export interface IUserModel extends Model<IUser> {
    findByUsername(username: string): Promise<any>;
    findBySessionId(sessionId: string): Promise<any>;
    updateToken(sessionId: string, newToken: string): Promise<any>;
}

export let UserSchema: Schema = new Schema({
    username: {
        type: String,
        required: true,
        minlength: 1,
        maxlength: 42,
        unique: true,
        trim: true,
    },
    password: {
        type: String,
        required: [true, "Password is required."],
        minlength: [7, "Password must be at-least 7 characters."],
        maxlength: [256, "Password cannot be more than 256 characters long."],
        trim: true,
    },
    sessionId: {
        type: String,
        default: getRandomString(secretTokenSize)
    },
    userSecret: {
        type: String,
        default: getRandomString(secretTokenSize)
    }
});

UserSchema.plugin(uniqueValidator, {message: "{PATH} already in use."});

// Password hash hook.
// Hash the password if it has been modified.
// Spaghetti, don'"`(<T> | <any> * any) touchd
UserSchema.pre("save", function(next) {
    // only hash the password if it has been modified (or is new)
    if (!this.isModified("password")) {
        return next();
    }

    // Hash the password with 10 rounds.
    bcrypt.hash(this.get("password"), 10, (err, hash) => {
        if (err) {
            return next(err);
        }

        this.set("password", hash);
        next();
    });
});

export function getRandomString(length: number = 32): string {
    return crypto.randomBytes(length).toString("hex");
}

UserSchema.statics.findByUsername = function(username: string) {
    return this.model("User").findOne({
        username
    });
};

UserSchema.statics.findBySessionId = function(sessionId: string) {
    return this.model("User").findOne({
        sessionId
    });
};

// TODO DOESNT WORK HELP I PANIC.!!1!1
UserSchema.statics.updateToken = function(sessionId: string, newToken: string) {
    return new Promise((resolve) => {
        this.model("User").findOneAndUpdate(
            { sessionId },
            { userSecret: newToken }, resolve);
    });
};

UserSchema.methods.removeSecretInfo = function() {
    const obj = this.toObject();
    delete obj.password;
    delete obj.sessionId;
    delete obj.userSecret;
    return obj;
};

export const User: IUserModel = model<IUser, IUserModel>("User", UserSchema);
