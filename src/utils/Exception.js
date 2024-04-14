class Exception {
  status;
  message;
  err;

  constructor(status, message, err) {
    this.status = status || 500;
    this.message = message;
    this.err = err;
  }
}

class BadRequestException extends Exception {
  constructor(message, err = null) {
    super(400, message, err);
  }
}

class NotFoundException extends Exception {
  constructor(message, err = null) {
    super(404, message, err);
  }
}

class InternalServerErrorException extends Exception {
  constructor(message, err = null) {
    super(500, message, err);
  }
}

class UnauthorizedException extends Exception {
  constructor(message, err = null) {
    super(401, message, err);
  }
}

class ForbiddenException extends Exception {
  constructor(message, err = null) {
    super(403, message, err);
  }
}

module.exports = {
  Exception,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
  UnauthorizedException,
  ForbiddenException,
};
