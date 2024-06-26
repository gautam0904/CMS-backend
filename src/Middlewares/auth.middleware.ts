import { NextFunction, Request, Response } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { BaseMiddleware } from "inversify-express-utils";
import jwt from "jsonwebtoken";
import { errMSG } from "../Constans/message" 
import { statuscode } from "../Constans/stacode";


const secretkey = process.env.AccessTokenSeceret || "";

export class Auth extends BaseMiddleware {
    handler(req: Request, res: Response, next: NextFunction): void {

        const token   = req.headers.token;

        if (!token) {
            res.status(401).json({
                message: errMSG.required("Access token")
            });
            return;
        }

        jwt.verify(token as string, secretkey, (err: any, decoded: any) => {
            if (err) {
              res.status(statuscode.Unauthorized).send(errMSG.expiredToken)
              return
            }
            req.find = decoded 
            req.body.USERID = decoded.userID;
            req.body.ROLE = decoded.userType;      
            next()
          })
    }
}