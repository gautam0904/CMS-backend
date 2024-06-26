import { Request, Response, NextFunction } from "express";
import { BaseMiddleware } from "inversify-express-utils";
import { ApiError } from "../Utiles/Apierror";
import { statuscode } from "../Constans/stacode";
import { errMSG } from "../Constans/message";


export class Role extends BaseMiddleware{
    handler(req: Request, res: Response, next: NextFunction): void {
        try {
            const permission = {
                admin: ['/user/deleteUser', '/user/get', `/user/update`,`/content/get`,`/content/update`,`/content/delete`,`/content/retreive`],
                owner: [`/content/create`,`/content/update`,`/content/delete`],
                user : [`content/get`]
            }

            const role = req.body.role;
            const currentRoute =
              req.protocol + "://" + req.get("host") + req.originalUrl;
            const parsedUrl = new URL(currentRoute);
            const pathname = parsedUrl.pathname;
            const userPermissions = permission[role as keyof typeof permission];
            if(userPermissions[role].includes(pathname)){
                next();
            }else{

                throw new ApiError(statuscode.forbidden , errMSG.notValidRole(role))
            }
        } catch (error : any) {
            res.status(error.statusCode || statuscode.NotImplemented).json({
                message : error.message
            })
        }
    }
} 