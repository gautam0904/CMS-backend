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
import mongoose from 'mongoose';

@injectable()
export class UserService {
  constructor() { }

  cloudinaryURL: string | null = null

  async createUser(userData: Iuser) {
    try {
      const existUser = await User.findOne({ email: userData.email });

      if (existUser) {
        throw new ApiError(statuscode.NOTACCEPTABLE, errMSG.exsistuser);
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
        statuscode: statuscode.OK,
        message: MSG.success('User created'),
        data: result
      }
    } catch (error) {
      // delete cloudinary image
      return {
        statuscode: error.statuscode || statuscode.INTERNALSERVERERROR,
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
      throw new ApiError(statuscode.NOCONTENT, errMSG.notExistUser)
    }

    const isMatch = bcrypt.compare(userData.password, existUser.password);

    if (!isMatch) {
      throw new ApiError(statuscode.NOTACCEPTABLE, errMSG.passwordNotMatch)
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
      statuscode: statuscode.OK,
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
      throw new ApiError(statuscode.NOCONTENT, `${errMSG.notExistUser}`);
    }
    const result = await User.findByIdAndDelete(
      { _id: existUser._id }
    );
    return {
      statuscode: statuscode.OK,
      message: MSG.success('user deleted'),
    };
  }

  async getUserById(id : string) {
    const users = await User.aggregate([
      {
        $match: {
          _id : id ? new mongoose.Types.ObjectId(id) : ''
        },
      },
      {
        $project: {
          name: 1,
          email: 1,
          usertype: 1,
          profilepic: 1,
        },
      },
    ]);
    if (!users) {
      throw new ApiError(statuscode.NOCONTENT, `${errMSG.userNotFound}`);
    }
    return {
      statuscode: statuscode.OK,
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
      throw new ApiError(statuscode.NOTIMPLEMENTED, errMSG.updateUser);
    }
    return {
      statuscode: statuscode.OK,
      data: result,
      message: MSG.success('User updated')
    };
  }
}