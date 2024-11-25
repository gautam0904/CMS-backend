import { controller, httpDelete, httpGet, httpPost, httpPut } from "inversify-express-utils";
import { UserService } from "../Services/user.service";
import { inject } from "inversify";
import { TYPES } from "../Types/types"
import { Iuser } from "../Interfaces/model.interface";
import { ApiError } from "../Utiles/Apierror";
import { statuscode } from "../Constans/stacode";
import { errMSG } from "../Constans/message";
import { Request, Response } from "express";
import { IupdateUser } from "../Interfaces/request.interface";
import { upload } from "../Middlewares/multer.midddleware";

@controller('/user')
export class UserController {
  private user: UserService;

  constructor(@inject(TYPES.UserService) userServices: UserService) {
    this.user = userServices;

  }

  @httpPost('/signup', upload.fields([{
    name: "profilePicture",
    maxCount: 1
  }]),)
  async signup(req: Request, res: Response) {
    try {

      const signupData: Iuser = req.body as unknown as Iuser;

      const files = req.files as { [fieldname: string]: Express.Multer.File[] };

      const profilePictureLocalpath = files?.profilePicture?.[0]?.path;
      signupData.profilepic = profilePictureLocalpath;

      const created_user = await this.user.createUser(signupData);

      res.status(created_user.statuscode).json(created_user);
    } catch (error: any) {
      res.status(error.stacode || 500).json({ message: error.message || errMSG.InternalServerErrorResult })
    }
  }

  @httpPost('/login')
  async login(req: Request, res: Response) {
    try {
      const loginData: Iuser = req.body as unknown as Iuser;

      if ([loginData.email, loginData.password].some((field) => field.trim() == "")) {
        throw new ApiError(statuscode.NotAcceptable, errMSG.exsistuser);
      }

      const login_user = await this.user.loginUser(loginData);

      res.status(login_user.statuscode).json(login_user);
    } catch (error: any) {
      res.status(error.stacode).json({ message: error.message || errMSG.InternalServerErrorResult })
    }

  }

  @httpDelete('/delete')
  async delete(req: Request, res: Response) {
    try {
      const userId = req.body.userId;
      if (!userId) {
        throw new ApiError(statuscode.NotAcceptable, errMSG.exsistuser);
      }

      const deleted_user = await this.user.deleteUser(userId);

      res.status(deleted_user.statuscode).json(deleted_user);
    } catch (error) {
      res.status(error.stacode).json({ message: error.message || errMSG.InternalServerErrorResult })
    }
  }

  @httpPut('/update')
  async update(req: Request, res: Response) {
    try {
      const updateData: IupdateUser = req.body as unknown as IupdateUser;

      if ([updateData.name, updateData.email, updateData.password, updateData.role].some((field) => field.trim() == "")) {
        throw new ApiError(statuscode.NotAcceptable, errMSG.exsistuser);
      }

      const updated_user = await this.user.updateUser(updateData);

      res.status(updated_user.statuscode).json(updated_user);
    } catch (error) {
      res.status(error.stacode).json({ message: error.message || errMSG.InternalServerErrorResult })
    }
  }

  @httpGet('/getAll')
  async getAll(req: Request, res: Response) {
    try {
      const allUser = await this.user.getAlluser();

      res.status(allUser.statuscode).json(allUser)
    } catch (error) {
      res.status(error.stacode).json({ message: error.message || errMSG.InternalServerErrorResult })
    }
  }
}