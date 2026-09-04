import { db } from "./index";

/**
 * A repository method typed with this can be called either with the global
 * `db` (default) or with a `tx` handed in by `db.transaction(async (tx) => ...)`.
 * Necessary anywhere multiple writes across modules need to succeed or fail
 * together — e.g. lead conversion creating a client + project atomically.
 */
export type DbOrTx = typeof db | Parameters<Parameters<typeof db.transaction>[0]>[0];