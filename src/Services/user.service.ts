import { injectable } from 'inversify'
import { Iuser } from '../Interfaces/model.interface';
import User from '../Models/user.model';
import { statuscode } from '../Constans/stacode';
import { MSG, errMSG } from '../Constans/message';
import { ApiError } from '../Utiles/Apierror';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt'
import { IupdateUser } from '../Interfaces/request.interface';
import { uploadOnCloudinary } from '../Utiles/cloudinary';

@injectable()
export class UserService {
  constructor() { }

  async createUser(userData: Iuser) {
    try {
      const existUser = await User.findOne({ email: userData.email });

      if (existUser) {
        throw new ApiError(statuscode.NotAcceptable, errMSG.exsistuser);
      }

      const profile = await uploadOnCloudinary(userData.profilepic);
      

      const result = await User.create({
        name: userData.name,
        email: userData.email,
        profipic : profile.url,
        profilepicId : profile.public_id,
        password: userData.password,
        role: userData.role
      });

      console.log(result);
      

      return {
        statuscode: statuscode.ok,
        Content : {
          message: MSG.success('User created'),
          data: result
        }       
      }
    } catch (error: any) {
      return {
        statuscode: error.statuscode,
        Content : {
          message: error.message || errMSG.defaultErrorMsg,
          data: error
        }
        
      }
    }
  }

  async loginUser(userData: Iuser) {
    try {
      const existUser = await User.findOne({
        email: userData.email
      });

      if (!existUser) {
        throw new ApiError(statuscode.NoteFound, errMSG.notExistUser)
      }

      const isMatch = bcrypt.compare(userData.password, existUser.password);

      if (!isMatch) {
        throw new ApiError(statuscode.NotAcceptable, errMSG.passwordNotMatch)
      }

      const token = jwt.sign(
        {
          id: existUser._id,
          role: existUser.role
        },
        process.env.AccessTokenSeceret,
        {
          expiresIn: process.env.AccessExpire
        });

      return {
        statuscode: statuscode.ok,
        Content: {
          message: MSG.success('User logged in'),
          data: {
            token: token,
            user: existUser
          }
        }

      }
    } catch (error: any) {
      return {
        statuscode: error.statuscode,
        Content: {
          message: error.message || errMSG.defaultErrorMsg,
          data: error
        }
      }
    }
  }

  async deleteUser(userId: string) {
    try {
      const existUser = await User.findOne({ _id: userId });

      if (!existUser) {
        throw new ApiError(statuscode.NoteFound, `${errMSG.notExistUser}`);
      }
      const result = await User.findByIdAndDelete(
        { _id: existUser._id }
      );
      return {
        statuscode: statuscode.ok,
        content: {
          message: MSG.success('user deleted'),
        },
      };
    } catch (error: any) {
      return {
        statuscode: error.statusCode || statuscode.NotImplemented,
        content: { message: error.message },
      };
    }
  }

  async getAlluser() {
    try {
      const users = await User.aggregate([
        {
          $match: {},
        },
        {
          $project: {
            name: 1,
            email: 1,
            usertype: 1,
          },
        },
      ]);
      if (users) {
        return {
          statuscode: statuscode.ok,
          content: { users },
        };
      } else {
        throw new ApiError(statuscode.NoteFound, `${errMSG.userNotFound}`);
      }
    } catch (error: any) {
      return {
        statuscode: error.statusCode || statuscode.NotImplemented,
        content: { message: error.message },
      };
    }
  }

  async updateUser(updateData: IupdateUser) {
    try {
      const result = await User.findByIdAndUpdate(
        {
          _id: updateData.id,
        },
        {
          $set: {
            usertype: updateData.role,
          },
        },
        { new: true }
      );
      if (result) {
        return {
          statuscode: statuscode.ok,
          Content: result,
        };
      }
      throw new ApiError(statuscode.NotImplemented, errMSG.updateUser);
    } catch (error: any) {
      return {
        statuscode: error.statusCode || statuscode.NotImplemented,
        Content: error.message,
      };
    }
  }

}