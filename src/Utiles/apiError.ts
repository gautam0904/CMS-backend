import { errMSG } from "../Constans/message";
import { injectable } from "inversify";

@injectable()
export class ApiError extends Error {
  statuscode: number;

  constructor(
    statusCode: number,
    message = errMSG.defaultErrorMsg
  ) {
    super(message);
    this.statuscode = statusCode;
    this.message = message;
  }
}