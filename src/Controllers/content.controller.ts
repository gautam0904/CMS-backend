import { Request, Response } from "express";
import { controller, httpGet, httpPost } from "inversify-express-utils";
import { Auth } from "../Middlewares/auth.middleware";
import { Role } from "../Middlewares/role.middleware";
import { upload } from "../Middlewares/multer.midddleware";
import { Icontent } from "../Interfaces/model.interface";
import { ContentService } from "../Services/content.service";
import { inject } from "inversify"
import { MSG } from "../Constans/message";
const upload = multer({ dest: 'uploads/' })

@controller("/content", Auth)
export class ContenetController {

    private content: ContentService

    constructor(@inject(ContentService) content: ContentService) {
        this.content = content;
    }


   fupload = upload.fields([{
        name: 'midea',
        maxCount: 1
    }])

    @httpPost("/create", Role, )
    async create(req: Request,  res: Response) {
        try {
            const contentData: Icontent = req.body;

            contentData.owner = contentData.updatedby = req.body.USERID;

            const files = req.files as { [fieldname: string]: Express.Multer.File[] };

            const profilePictureLocalpath = files?.midea?.[0]?.path;
            contentData.midea = profilePictureLocalpath;
    

            const content = await this.content.createContent(contentData);

            res.status(200).json({
                message: MSG.success('content is created'),
                content
            });
        } catch (error: any) {
            res.status(error.statusCode || 500).json({
                message: error.message
            });
        }
    }


    @httpGet('/get' , Role)
    async get(req : Request, res : Response){
        try {
           const content = await this.content.getContent();
            res.status(200).json({
                message : MSG.success('content is get'),
                content
            })
           
        } catch (error : any) {
            res.status(error.statusCode || 500).json({
                message : error.message

            })
        }
    }
}