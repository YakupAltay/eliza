import { IAgentRuntime } from "@elizaos/core";
import { z } from "zod";

const celestiaEnvSchema = z.object({
    CELESTIA_LIGHT_NODE_RPC_URL: z.string().min(1, "Celestia Light Node RPC URL is required"),
	CELESTIA_AI_AGENT_NAMESPACE: z.string().min(1, "Celestia AI Agent Namespace is required"),
	CELESTIA_DEFAULT_TX_FEE: z.number().min(0, "Default Transaction Fee is required"),
});

export type celestiaConfig = z.infer<typeof celestiaEnvSchema>;

export async function validateCelestiaConfig(
	runtime: IAgentRuntime
): Promise<celestiaConfig> {
	try {
		const config = {
			CELESTIA_LIGHT_NODE_RPC_URL: runtime.getSetting("CELESTIA_LIGHT_NODE_RPC_URL")|| process.env.CELESTIA_LIGHT_NODE_RPC_URL,
			CELESTIA_AI_AGENT_NAMESPACE: runtime.getSetting("CELESTIA_AI_AGENT_NAMESPACE") || process.env.CELESTIA_AI_AGENT_NAMESPACE,
			CELESTIA_DEFAULT_TX_FEE: parseFloat(runtime.getSetting("CELESTIA_DEFAULT_TX_FEE") || process.env.CELESTIA_DEFAULT_TX_FEE),
		};

		return celestiaEnvSchema.parse(config);
	} catch (error) {
		if (error instanceof z.ZodError) {
			const errorMessages = error.errors
				.map((err) => `${err.path.join(".")}: ${err.message}`)
				.join("\n");
			throw new Error(
				`Celestia configuration validation failed:\n${errorMessages}`
			);
		}
		throw error;
	}
}