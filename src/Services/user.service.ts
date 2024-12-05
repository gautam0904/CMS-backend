import { injectable } from 'inversify'
import { Iuser } from '../Interfaces/model.interface';
import User from '../Models/user.model';
import { statuscode } from '../Constans/stacode';
import { MSG, errMSG } from '../Constans/message';
import { ApiError, Helper, uploadOnCloudinary, deleteonCloudinary } from '../Utiles';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';

@injectable()
export class UserService {
  constructor(private helper: Helper) { }

  cloudinaryURL: string | null = null

  async createUser(userData: Iuser) {
    try {
      const existUser = await User.findOne({ email: userData.email });

      if (existUser) {
        throw new ApiError(statuscode.NOTACCEPTABLE, errMSG.exsistuser);
      }

      const profile = await uploadOnCloudinary(userData.profilepic);

      this.cloudinaryURL = profile.data.url

      const result = await User.create({
        name: userData.name,
        email: userData.email,
        profilepic: profile.data.url,
        profilepicId: profile.data.public_id,
        password: userData.password,
        role: userData.role
      });
      this.cloudinaryURL = null
      return {
        statuscode: statuscode.OK,
        message: MSG.success('User created'),
        data: result
      }
    } catch (error) {
      deleteonCloudinary(this.cloudinaryURL);
      this.cloudinaryURL = null;
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

  async getUserById(id: string) {
    const userMatch = id ? { _id: new mongoose.Types.ObjectId(id) } : {};
    const users = await User.aggregate([
      {
        $match: userMatch,
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

  async updateUserWithoutProfilePicture(updateData: Iuser) {
    const result = await User.findByIdAndUpdate(
      {
        _id: updateData._id,
      },
      {
        $set: {
          name: updateData.name,
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

  async updateUserWithProfilePicture(updateData: Iuser) {
    let uploadFileUrl: string | null = null;
    try {
      const profile = await this.helper.uploadMedia(updateData.profilepic);
      uploadFileUrl = profile.url;

      const oldUser = await User.findById(updateData._id);
      if (!oldUser) {
        throw new ApiError(statuscode.NOTIMPLEMENTED, errMSG.userNotFound);
      }
      const oldMideaDeletion = await deleteonCloudinary(oldUser.profilepic);

      if (!oldMideaDeletion.success) {
        console.warn("Old media deletion failed:", oldMideaDeletion.message);
      }

      const result = await User.findByIdAndUpdate(
        {
          _id: updateData._id,
        },
        {
          $set: {
            name: updateData.name,
            profilepic: uploadFileUrl,
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
    } catch (error) {
      if (uploadFileUrl) {
        deleteonCloudinary(uploadFileUrl);
      }
      return {
        statuscode: error.statuscode || statuscode.INTERNALSERVERERROR,
        message: error.message || errMSG.InternalServerErrorResult,
      }
    }
  }
}