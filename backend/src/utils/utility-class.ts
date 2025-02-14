class ErrorHandler extends Error {
//   statusCode: number;
  constructor(public message: string, public statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

export default ErrorHandler;