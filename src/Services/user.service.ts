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

  cloudinaryURL: string | null = null

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
        profipic: profile.url,
        profilepicId: profile.public_id,
        password: userData.password,
        role: userData.role
      });

      return {
        statuscode: statuscode.ok,
        message: MSG.success('User created'),
        data: result
      }
    } catch (error) {
      // delete cloudinary image
      return {
        statuscode: error.statuscode || 500,
        message: error.message || errMSG.InternalServerErrorResult,
        data: null
      }
    }
  }

  async loginUser(userData: Iuser) {
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
      message: MSG.success('User logged in'),
      data: {
        token: token,
        user: existUser
      }
    }
  }

  async deleteUser(userId: string) {
    const existUser = await User.findOne({ _id: userId });

    if (!existUser) {
      throw new ApiError(statuscode.NoteFound, `${errMSG.notExistUser}`);
    }
    const result = await User.findByIdAndDelete(
      { _id: existUser._id }
    );
    return {
      statuscode: statuscode.ok,
      message: MSG.success('user deleted'),
    };
  }

  async getAlluser() {
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
    if (!users) {
      throw new ApiError(statuscode.NoteFound, `${errMSG.userNotFound}`);
    }
    return {
      statuscode: statuscode.ok,
      data: users,
      message: MSG.success('All user get')
    };
  }

  async updateUser(updateData: IupdateUser) {
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
    if (!result) {
      throw new ApiError(statuscode.NotImplemented, errMSG.updateUser);
    }
    return {
      statuscode: statuscode.ok,
      data: result,
      message: MSG.success('User updated')
    };
  }
}