/** Base error for failures raised by the Mastra adapter. */
export class MastraAdapterError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MastraAdapterError";
  }
}

/** Raised when an Agent Spec datastore type has no Mastra mapping. */
export class UnsupportedMastraDatastoreError extends MastraAdapterError {
  constructor(componentType: string) {
    super(`Unsupported Agent Spec datastore for Mastra adapter: ${componentType}`);
    this.name = "UnsupportedMastraDatastoreError";
  }
}

/** Raised when a datastore feature cannot be represented by Mastra. */
export class UnsupportedMastraDatastoreFeatureError extends MastraAdapterError {
  constructor(feature: string) {
    super(`Unsupported Agent Spec datastore feature for Mastra adapter: ${feature}`);
    this.name = "UnsupportedMastraDatastoreFeatureError";
  }
}

/** Raised when datastore configuration cannot produce a valid Mastra target. */
export class InvalidMastraDatastoreConfigError extends MastraAdapterError {
  constructor(message: string) {
    super(`Invalid Agent Spec datastore configuration for Mastra adapter: ${message}`);
    this.name = "InvalidMastraDatastoreConfigError";
  }
}

/** Raised when a required Mastra package or export is unavailable. */
export class MissingMastraRuntimeDependencyError extends MastraAdapterError {
  constructor(packageName: string, exportName: string) {
    super(
      `Mastra runtime dependency is required: install '${packageName}' with export '${exportName}', or pass a custom runtime to the Mastra adapter.`,
    );
    this.name = "MissingMastraRuntimeDependencyError";
  }
}

/** Raised when an Agent Spec LLM configuration has no Mastra mapping. */
export class UnsupportedMastraModelError extends MastraAdapterError {
  constructor(componentType: string) {
    super(`Unsupported Agent Spec LLM config for Mastra adapter: ${componentType}`);
    this.name = "UnsupportedMastraModelError";
  }
}

/** Raised when an Agent Spec tool type has no Mastra mapping. */
export class UnsupportedMastraToolError extends MastraAdapterError {
  constructor(componentType: string) {
    super(`Unsupported Agent Spec tool for Mastra adapter: ${componentType}`);
    this.name = "UnsupportedMastraToolError";
  }
}

/** Raised when a ServerTool has no executable runtime binding. */
export class MissingMastraToolExecutorError extends MastraAdapterError {
  constructor(toolName: string) {
    super(
      `ServerTool '${toolName}' requires an executor in the Mastra toolRegistry.`,
    );
    this.name = "MissingMastraToolExecutorError";
  }
}

/** Raised when Agent Spec tool names would collide in a Mastra tool map. */
export class DuplicateMastraToolNameError extends MastraAdapterError {
  constructor(toolName: string) {
    super(`Duplicate Agent Spec tool name cannot be mapped to Mastra: ${toolName}`);
    this.name = "DuplicateMastraToolNameError";
  }
}

/** Raised when an Agent feature cannot be represented by Mastra. */
export class UnsupportedMastraAgentFeatureError extends MastraAdapterError {
  constructor(feature: string) {
    super(`Unsupported Agent Spec agent feature for Mastra adapter: ${feature}`);
    this.name = "UnsupportedMastraAgentFeatureError";
  }
}

/** Raised when loaded Agent Spec data is invalid for the Mastra adapter. */
export class InvalidMastraAgentSpecError extends MastraAdapterError {
  constructor(message: string) {
    super(message);
    this.name = "InvalidMastraAgentSpecError";
  }
}

/** Raised when an Agent Spec node type has no Mastra workflow mapping. */
export class UnsupportedMastraFlowNodeError extends MastraAdapterError {
  constructor(componentType: string) {
    super(`Unsupported Agent Spec flow node for Mastra adapter: ${componentType}`);
    this.name = "UnsupportedMastraFlowNodeError";
  }
}

/** Raised when a Flow graph cannot be represented by the supported workflow shape. */
export class UnsupportedMastraFlowShapeError extends MastraAdapterError {
  constructor(message: string) {
    super(message);
    this.name = "UnsupportedMastraFlowShapeError";
  }
}

/** Raised when an executable Flow node has no runtime binding. */
export class MissingMastraFlowNodeExecutorError extends MastraAdapterError {
  constructor(nodeName: string) {
    super(`Flow node '${nodeName}' requires an executor for Mastra conversion.`);
    this.name = "MissingMastraFlowNodeExecutorError";
  }
}

/** Raised when a Mastra runtime object cannot be exported without losing behavior. */
export class UnsupportedMastraExportError extends MastraAdapterError {
  constructor(message: string) {
    super(message);
    this.name = "UnsupportedMastraExportError";
  }
}
