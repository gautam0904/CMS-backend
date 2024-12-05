import { controller, httpDelete, httpGet, httpPost, httpPut } from "inversify-express-utils";
import { UserService } from "../Services/user.service";
import { inject } from "inversify";
import { TYPES } from "../Types/types"
import { Iuser } from "../Interfaces/model.interface";
import { ApiError } from "../Utiles";
import { statuscode } from "../Constans/stacode";
import { errMSG } from "../Constans/message";
import { Request, Response } from "express";
import { upload } from "../Middlewares/multer.midddleware";
import { Auth } from "../Middlewares/auth.middleware";
import { Role } from "../Middlewares/role.middleware";

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
      res.status(error.statuscode || statuscode.INTERNALSERVERERROR).json({ message: error.message || errMSG.InternalServerErrorResult })
    }
  }

  @httpPost('/login')
  async login(req: Request, res: Response) {
    try {
      const loginData: Iuser = req.body as unknown as Iuser;

      if ([loginData.email, loginData.password].some((field) => field.trim() == "")) {
        throw new ApiError(statuscode.NOTACCEPTABLE, errMSG.exsistuser);
      }

      const login_user = await this.user.loginUser(loginData);

      res.status(login_user.statuscode).json(login_user);
    } catch (error: any) {
      res.status(error.statuscode || statuscode.INTERNALSERVERERROR).json({ message: error.message || errMSG.InternalServerErrorResult })
    }

  }

  @httpDelete('/delete', Auth, Role)
  async delete(req: Request, res: Response) {
    try {
      const userId = req.body.userId;
      const role = req.body.ROLE || req.headers.ROLE;
      const currentUserId = req.body.USERID || req.headers.USERID;
      if (!userId) {
        throw new ApiError(statuscode.NOTACCEPTABLE, errMSG.exsistuser);
      }
      if (role === 'admin' && userId != currentUserId) {
        throw new ApiError(statuscode.NOTACCEPTABLE, errMSG.notValidRole(role, 'update the another user'));
      }

      const deleted_user = await this.user.deleteUser(userId);

      res.status(deleted_user.statuscode).json(deleted_user);
    } catch (error) {
      res.status(error.statuscode || statuscode.INTERNALSERVERERROR).json({ message: error.message || errMSG.InternalServerErrorResult })
    }
  }

  @httpPut('/update', Auth, Role, upload.fields([{
    name: "profilePicture",
    maxCount: 1
  }]),)
  async update(req: Request, res: Response,) {
    try {
      const updateData: Iuser = req.body as unknown as Iuser;
      const role = req.body.ROLE || req.headers.ROLE;
      const currentUserId = req.body.USERID || req.headers.USERID;

      if (updateData._id != currentUserId) {
        throw new ApiError(statuscode.NOTACCEPTABLE, errMSG.notValidRole(role, 'update the another user'));
      }

      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const profilePictureLocalpath = files?.profilePicture?.[0]?.path;
      updateData.profilepic = profilePictureLocalpath;

      const updated_user = profilePictureLocalpath ? await this.user.updateUserWithProfilePicture(updateData) : await this.user.updateUserWithoutProfilePicture(updateData)

      res.status(updated_user.statuscode).json(updated_user);
    } catch (error) {
      res.status(error.statuscode || statuscode.INTERNALSERVERERROR).json({ message: error.message || errMSG.InternalServerErrorResult })
    }
  }

  @httpGet('/getById/:id?', Auth, Role)
  async getAll(req: Request, res: Response) {
    try {
      const userId = req.params.id
      const allUser = await this.user.getUserById(userId);

      res.status(allUser.statuscode).json(allUser)
    } catch (error) {
      res.status(error.statuscode || statuscode.INTERNALSERVERERROR).json({ message: error.message || errMSG.InternalServerErrorResult })
    }
  }
}
