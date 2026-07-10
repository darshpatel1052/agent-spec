import type {
  InMemoryCollectionDatastore,
  OracleDatabaseDatastore,
  PostgresDatabaseDatastore,
} from "../../datastores/index.js";
import {
  InvalidMastraDatastoreConfigError,
  UnsupportedMastraDatastoreError,
  UnsupportedMastraDatastoreFeatureError,
} from "./errors.js";
import type {
  AgentSpecMastraDatastore,
  MastraDatastoreTarget,
  MastraDatastoreTargetOptions,
  MastraInMemoryDatastoreTarget,
  MastraPostgresDatastoreTarget,
  MastraPostgresStoreConfig,
} from "./types.js";

type MastraDatastoreCandidate =
  | AgentSpecMastraDatastore
  | OracleDatabaseDatastore;

export const resolveMastraDatastore = (
  datastore: MastraDatastoreCandidate,
  options: MastraDatastoreTargetOptions = {},
): MastraDatastoreTarget => {
  if (datastore.componentType === "InMemoryCollectionDatastore") {
    return resolveInMemoryDatastore(datastore, options);
  }

  if (datastore.componentType === "PostgresDatabaseDatastore") {
    return resolvePostgresDatastore(datastore, options);
  }

  throw new UnsupportedMastraDatastoreError(datastore.componentType);
};

export const resolveInMemoryDatastore = (
  datastore: InMemoryCollectionDatastore,
  options: MastraDatastoreTargetOptions = {},
): MastraInMemoryDatastoreTarget => {
  const id = options.id ?? datastore.id;

  return {
    provider: "in-memory",
    packageName: "@mastra/core/storage",
    exportName: "InMemoryStore",
    id,
    datastoreSchema: datastore.datastoreSchema,
    config: { id },
  };
};

export const resolvePostgresDatastore = (
  datastore: PostgresDatabaseDatastore,
  options: MastraDatastoreTargetOptions = {},
): MastraPostgresDatastoreTarget => {
  const id = options.id ?? datastore.id;
  const connection = datastore.connectionConfig;
  // Datastore resolvers only build an import/config target. They should never
  // open sockets, run migrations, or require the Mastra provider package.
  const config: MastraPostgresStoreConfig = {
    id,
    connectionString: resolvePostgresConnectionString(connection),
    ...storageRuntimeOptions(options),
  };

  return {
    provider: "postgres",
    packageName: "@mastra/pg",
    exportName: "PostgresStore",
    id,
    datastoreSchema: datastore.datastoreSchema,
    config,
  };
};

const resolvePostgresConnectionString = (
  connection: PostgresDatabaseDatastore["connectionConfig"],
): string => {
  if (connection.sslmode === "allow" || connection.sslmode === "prefer") {
    throw new UnsupportedMastraDatastoreFeatureError(
      `PostgresDatabaseDatastore.connectionConfig.sslmode='${connection.sslmode}'`,
    );
  }

  let connectionUrl: URL;
  try {
    connectionUrl = new URL(connection.url);
  } catch {
    throw new InvalidMastraDatastoreConfigError(
      "PostgresDatabaseDatastore.connectionConfig.url must be a valid PostgreSQL URL.",
    );
  }

  if (connectionUrl.protocol !== "postgres:" && connectionUrl.protocol !== "postgresql:") {
    throw new InvalidMastraDatastoreConfigError(
      "PostgresDatabaseDatastore.connectionConfig.url must use the postgres or postgresql protocol.",
    );
  }

  if (connection.sslcrl || connectionUrl.searchParams.has("sslcrl")) {
    throw new UnsupportedMastraDatastoreFeatureError(
      "PostgresDatabaseDatastore.connectionConfig.sslcrl",
    );
  }

  connectionUrl.username = encodePostgresCredential(connection.user);
  connectionUrl.password = encodePostgresCredential(connection.password);
  connectionUrl.searchParams.set("sslmode", connection.sslmode);

  if (connection.sslmode === "disable") {
    connectionUrl.searchParams.delete("uselibpqcompat");
  } else {
    connectionUrl.searchParams.set("uselibpqcompat", "true");
  }

  setPostgresUrlParameter(connectionUrl, "sslcert", connection.sslcert);
  setPostgresUrlParameter(connectionUrl, "sslkey", connection.sslkey);
  setPostgresUrlParameter(connectionUrl, "sslrootcert", connection.sslrootcert);

  return connectionUrl.toString();
};

const encodePostgresCredential = (value: string): string => {
  try {
    return encodeURIComponent(value);
  } catch {
    throw new InvalidMastraDatastoreConfigError(
      "PostgresDatabaseDatastore credentials must be valid Unicode strings.",
    );
  }
};

const setPostgresUrlParameter = (
  url: URL,
  name: "sslcert" | "sslkey" | "sslrootcert",
  value: string | undefined,
): void => {
  if (value) {
    url.searchParams.set(name, value);
  }
};

const storageRuntimeOptions = (
  options: MastraDatastoreTargetOptions,
): Pick<MastraPostgresStoreConfig, "schemaName" | "disableInit"> => ({
  ...(options.schemaName ? { schemaName: options.schemaName } : {}),
  ...(options.disableInit === undefined
    ? {}
    : { disableInit: options.disableInit }),
});
