export class StudioError extends Error {
  constructor(status, message) {
    super(message);
    this.name = "StudioError";
    this.status = status;
  }
}
