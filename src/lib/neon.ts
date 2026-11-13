import { Pool, type PoolClient } from "@neondatabase/serverless";

/**
 * Lazy Neon Postgres connection pool — `@neondatabase/serverless`'s
 * `Pool` is API-compatible with `pg`'s `Pool` (same `.query()`,
 * `.connect()`, real `BEGIN`/`COMMIT` transactions via a checked-out
 * client) but speaks to Neon over WebSockets instead of a raw TCP
 * socket, which is what makes it usable from a serverless/edge
 * runtime at all.
 *
 * Created lazily, on first use, rather than at module load time:
 * Next.js evaluates top-level module code during `next build`, and
 * `DATABASE_URL` isn't set until the Neon Marketplace integration is
 * installed — constructing the pool eagerly would crash every build
 * until that happens.
 */
let _pool: Pool | null = null;

function getPool(): Pool {
  if (!_pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error(
        "DATABASE_URL is not set. Install the Neon integration (`vercel integration add neon`) " +
          "via the Vercel Marketplace, then run `vercel env pull` to bring it into .env.local."
      );
    }
    _pool = new Pool({ connectionString });
  }
  return _pool;
}

/** Runs one query against the pool — Neon/`pg` style: `$1, $2, ...`
 *  placeholders, params passed separately (never string-interpolated
 *  into the query text), JSONB columns come back already parsed as
 *  plain JS values. */
export async function query<T = unknown>(text: string, params: unknown[] = []): Promise<T[]> {
  const result = await getPool().query(text, params);
  return result.rows as T[];
}

/** Runs `run` inside a real `BEGIN`/`COMMIT` transaction on a single
 *  checked-out client, rolling back on any error. Needed only for the
 *  handful of writes that must be atomic across more than one
 *  statement (see the "exclusive flag" writes in `db.ts` — unsetting
 *  every other row's flag and setting the new one must never be
 *  observably split in two by a concurrent request). Everything else
 *  can use the plain `query()` above — Postgres itself already
 *  serializes concurrent single-statement writes correctly. */
export async function withTransaction<T>(run: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    const result = await run(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
