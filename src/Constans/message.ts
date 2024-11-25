export const MSG = {
  DBconnected: 'Database is connected successfully',
  login: 'Login successfully done',
  serverlisten: 'Server is listening on port',
  usercreated: 'User is created successfully',
  loginSuccess: 'User is logged in successfully',
  success: (task: string) => { return `${task} is done successfully` }
}

export const errMSG = {
  connectDB: 'Database is not connected',
  required: (field: string) => { return `${field} is required for prceding to next` },
  InternalServerErrorResult: 'Internal server error response',
  defaultErrorMsg: 'some things went wrong',
  exsistuser: 'Email id is already exist ',
  createUser: 'user is not created',
  notExistUser: 'User is not exist',
  passwordNotMatch: 'Password is not match',
  expiredToken: 'Access token is not verified it may be expired',
  notValidRole: (Role: string) => { return `${Role} don't have permission to access this functionality.` },
  userNotFound: 'There is no user ',
  updateUser: 'User is not updated',
  notFoundDeleted: 'There is no deleted user',
  retreiveUser: 'User is not retrieved',
  invalidID: 'Invalid object ID',
}