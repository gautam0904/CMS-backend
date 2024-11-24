import { NextFunction, Request, Response } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { BaseMiddleware } from "inversify-express-utils";
import jwt from "jsonwebtoken";
import { errMSG } from "../Constans/message" 
import { statuscode } from "../Constans/stacode";
import { ApiError } from "../Utiles/Apierror";

export class Auth extends BaseMiddleware {
    handler(req: Request, res: Response, next: NextFunction): void {
      const secretkey = process.env.AccessTokenSeceret || "";
        const token   = req.headers.token;

        if (!token) {
            res.status(401).json({
                message: errMSG.required("Access token")
            });
            return;
        }

         const tokenarray = (token as string).split(" ");

      if (tokenarray[0] !== "Bearer") {
        throw new ApiError(statuscode.Unauthorized, errMSG.required("Bearer token")
        );
      }

        jwt.verify(tokenarray[1] as string, secretkey, (err: any, decoded: any) => {
            if (err) {
              res.status(statuscode.Unauthorized).send(errMSG.expiredToken)
              return
            }
            req.find = decoded 
            req.body.USERID = decoded.id;
            req.body.ROLE = decoded.role;         
            next()
          })
    }
}
