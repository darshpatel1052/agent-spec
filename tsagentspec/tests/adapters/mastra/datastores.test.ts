import { describe, expect, it } from "vitest";
import {
  createInMemoryCollectionDatastore,
  createOracleDatabaseDatastore,
  createPostgresDatabaseDatastore,
  createTlsOracleDatabaseConnectionConfig,
  createTlsPostgresDatabaseConnectionConfig,
} from "../../../src/index.js";
import {
  InvalidMastraDatastoreConfigError,
  resolveMastraDatastore,
  UnsupportedMastraDatastoreError,
  UnsupportedMastraDatastoreFeatureError,
} from "../../../src/adapters/mastra/index.js";

describe("Mastra datastore resolver", () => {
  it("maps InMemoryCollectionDatastore to Mastra InMemoryStore target", () => {
    const datastore = createInMemoryCollectionDatastore({
      id: "memory-ds",
      name: "memory",
      datastoreSchema: { cache: { value: { type: "string" } } },
    });

    const target = resolveMastraDatastore(datastore);

    expect(target).toMatchObject({
      provider: "in-memory",
      packageName: "@mastra/core/storage",
      exportName: "InMemoryStore",
      id: "memory-ds",
      config: { id: "memory-ds" },
    });
    expect(target.datastoreSchema).toEqual(datastore.datastoreSchema);
  });

  it("maps PostgresDatabaseDatastore url to PostgresStore connectionString", () => {
    const datastore = createPostgresDatabaseDatastore({
      id: "pg-ds",
      name: "postgres",
      datastoreSchema: { users: { id: { type: "string" } } },
      connectionConfig: createTlsPostgresDatabaseConnectionConfig({
        name: "pg-connection",
        user: "postgres",
        password: "secret",
        url: "postgresql://localhost:5432/agentspec",
        sslmode: "verify-full",
        sslcert: "/certs/client.pem",
        sslkey: "/certs/client-key.pem",
        sslrootcert: "/certs/ca.pem",
      }),
    });

    const target = resolveMastraDatastore(datastore, {
      schemaName: "agentspec",
      disableInit: true,
    });

    expect(target.provider).toBe("postgres");
    expect(target.packageName).toBe("@mastra/pg");
    expect(target.exportName).toBe("PostgresStore");
    expect(target.config).toEqual({
      id: "pg-ds",
      connectionString:
        "postgresql://postgres:secret@localhost:5432/agentspec?sslmode=verify-full&uselibpqcompat=true&sslcert=%2Fcerts%2Fclient.pem&sslkey=%2Fcerts%2Fclient-key.pem&sslrootcert=%2Fcerts%2Fca.pem",
      schemaName: "agentspec",
      disableInit: true,
    });
  });

  it("maps disabled Postgres SSL mode to false", () => {
    const datastore = createPostgresDatabaseDatastore({
      id: "pg-no-ssl",
      name: "postgres",
      datastoreSchema: {},
      connectionConfig: createTlsPostgresDatabaseConnectionConfig({
        name: "pg-connection",
        user: "postgres",
        password: "secret",
        url: "postgresql://localhost:5432/agentspec",
        sslmode: "disable",
      }),
    });

    const target = resolveMastraDatastore(datastore);

    expect(target.provider).toBe("postgres");
    expect(target.config.connectionString).toBe(
      "postgresql://postgres:secret@localhost:5432/agentspec?sslmode=disable",
    );
    expect(target.config).not.toHaveProperty("ssl");
  });

  it("escapes credentials and replaces credentials already present in the URL", () => {
    const datastore = createPostgresDatabaseDatastore({
      id: "pg-escaped",
      name: "postgres",
      datastoreSchema: {},
      connectionConfig: createTlsPostgresDatabaseConnectionConfig({
        name: "pg-connection",
        user: "user@corp",
        password: "p@ss:/?#%",
        url: "postgresql://old-user:old-password@localhost:5432/agentspec?application_name=test",
        sslmode: "require",
      }),
    });

    const target = resolveMastraDatastore(datastore);
    const connectionUrl = new URL(target.config.connectionString);

    expect(decodeURIComponent(connectionUrl.username)).toBe("user@corp");
    expect(decodeURIComponent(connectionUrl.password)).toBe("p@ss:/?#%");
    expect(connectionUrl.searchParams.get("application_name")).toBe("test");
    expect(connectionUrl.searchParams.get("sslmode")).toBe("require");
    expect(connectionUrl.searchParams.get("uselibpqcompat")).toBe("true");
  });

  it.each(["allow", "prefer"] as const)(
    "rejects Postgres SSL mode '%s' because Mastra cannot preserve fallback semantics",
    (sslmode) => {
      const datastore = createPostgresDatabaseDatastore({
        id: `pg-${sslmode}`,
        name: "postgres",
        datastoreSchema: {},
        connectionConfig: createTlsPostgresDatabaseConnectionConfig({
          name: "pg-connection",
          user: "postgres",
          password: "secret",
          url: "postgresql://localhost:5432/agentspec",
          sslmode,
        }),
      });

      expect(() => resolveMastraDatastore(datastore)).toThrow(
        UnsupportedMastraDatastoreFeatureError,
      );
    },
  );

  it("rejects Postgres CRL paths that Mastra does not consume", () => {
    const datastore = createPostgresDatabaseDatastore({
      id: "pg-crl",
      name: "postgres",
      datastoreSchema: {},
      connectionConfig: createTlsPostgresDatabaseConnectionConfig({
        name: "pg-connection",
        user: "postgres",
        password: "secret",
        url: "postgresql://localhost:5432/agentspec",
        sslmode: "verify-full",
        sslcrl: "/certs/crl.pem",
      }),
    });

    expect(() => resolveMastraDatastore(datastore)).toThrow(
      UnsupportedMastraDatastoreFeatureError,
    );
  });

  it("rejects non-PostgreSQL connection URLs", () => {
    const datastore = createPostgresDatabaseDatastore({
      id: "pg-invalid-url",
      name: "postgres",
      datastoreSchema: {},
      connectionConfig: createTlsPostgresDatabaseConnectionConfig({
        name: "pg-connection",
        user: "postgres",
        password: "secret",
        url: "https://localhost:5432/agentspec",
        sslmode: "require",
      }),
    });

    expect(() => resolveMastraDatastore(datastore)).toThrow(
      InvalidMastraDatastoreConfigError,
    );
  });

  it("does not map OracleDatabaseDatastore until Mastra publishes an official provider", () => {
    const datastore = createOracleDatabaseDatastore({
      id: "oracle-ds",
      name: "oracle",
      datastoreSchema: { threads: { id: { type: "string" } } },
      connectionConfig: createTlsOracleDatabaseConnectionConfig({
        name: "oracle-connection",
        user: "admin",
        password: "secret",
        dsn: "localhost:1521/FREEPDB1",
        configDir: "/opt/oracle/network/admin",
      }),
    });

    expect(() => resolveMastraDatastore(datastore)).toThrow(
      UnsupportedMastraDatastoreError,
    );
  });
});
