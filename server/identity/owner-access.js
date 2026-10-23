import { assertVerifiedOwner, OwnerNotAuthorized } from "./session-store.js";

/**
 * A private object owner is always checked server-side, not from form fields.
 * Session objects MUST be obtained from resolveOwnerSession (DB-verified).
 */
export function assertOwnedResource(session, resource, { now = new Date() } = {}) {
  const ownerId = assertVerifiedOwner(session, { now });
  if (!resource || typeof resource !== "object" ||
      resource.created_by !== ownerId) {
    throw new OwnerNotAuthorized();
  }
  return resource;
}
