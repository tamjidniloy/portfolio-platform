// Public Studio API. Other app modules and operator scripts import through this stable facade.
export { studioPool, initializeStudio, getStudioContent, closeStudio } from "./db.js";
export { makePasswordHash, matchesPassword, createInitialOwner, changeStudioPassword, studioSession, cookieToken } from "./auth.js";
export { createStudioRouter } from "./http.js";
export { mediaDirectory, serveStudioImage } from "./media.js";
