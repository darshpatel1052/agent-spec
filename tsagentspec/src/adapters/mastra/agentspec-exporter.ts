import type { Agent } from "../../agents/index.js";
import type { Flow } from "../../flows/index.js";
import { AgentSpecSerializer } from "../../serialization/index.js";
import {
  MastraToAgentSpecConverter,
  type AgentSpecExportedComponent,
  type MastraToAgentSpecConversionOptions,
} from "./agentspec-converter.js";

export type AgentSpecExporterOptions = MastraToAgentSpecConversionOptions;

/** Exports supported Mastra runtime objects as Agent Spec components or text. */
export class AgentSpecExporter {
  private readonly serializer: AgentSpecSerializer;
  private readonly converter: MastraToAgentSpecConverter;

  constructor(options: AgentSpecExporterOptions = {}) {
    this.serializer = new AgentSpecSerializer();
    this.converter = new MastraToAgentSpecConverter(options);
  }

  /** Return the converter used by this exporter. */
  get runtimeToAgentSpecConverter(): MastraToAgentSpecConverter {
    return this.converter;
  }

  /** Convert a supported Mastra object into an Agent Spec component. */
  toComponent(input: unknown): AgentSpecExportedComponent {
    return this.converter.convert(input);
  }

  /** Convert a supported Mastra agent into an Agent Spec Agent. */
  toAgent(input: unknown): Agent {
    return this.converter.toAgent(input);
  }

  /** Convert an adapter-created Mastra workflow into an Agent Spec Flow. */
  toFlow(input: unknown): Flow {
    return this.converter.toFlow(input);
  }

  /** Serialize a supported Mastra object as Agent Spec JSON. */
  toJson(
    input: unknown,
    options?: Parameters<AgentSpecSerializer["toJson"]>[1],
  ): ReturnType<AgentSpecSerializer["toJson"]> {
    return this.serializer.toJson(this.toComponent(input), options);
  }

  /** Serialize a supported Mastra object as Agent Spec YAML. */
  toYaml(
    input: unknown,
    options?: Parameters<AgentSpecSerializer["toYaml"]>[1],
  ): ReturnType<AgentSpecSerializer["toYaml"]> {
    return this.serializer.toYaml(this.toComponent(input), options);
  }
}
