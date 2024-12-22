import { elizaLogger } from "@elizaos/core";
import {
    ActionExample,
    HandlerCallback,
    IAgentRuntime,
    Memory,
    ModelClass,
    State,
    type Action,
} from "@elizaos/core";
import { composeContext } from "@elizaos/core";
import { generateObjectDeprecated } from "@elizaos/core";
import celestiaRequest from "../functions/celestiaRequest.js";
import encodeDataToBase64String from "../functions/encodeDataToBase64String.js";
import getCeleniumURL from "../functions/getCeleniumURL.js";
import { validateCelestiaConfig } from "../environment.js";

const submitBlobTemplate = `Respond with a JSON markdown block containing only the extracted values. Use null for any values that cannot be determined.

Example response:
\`\`\`json
{
    "data": "Hello World, this is the data I submitted"
}
\`\`\`

{{recentMessages}}

Given the recent messages, extract the following information about the requested Celestia blob submission:
- Data to be submitted

Respond with a JSON markdown block containing only the extracted values.`;

export default {
    name: "SUBMIT_BLOB",
    similes: [
        "SUBMIT_BLOB_TO_CELESTIA",
        "SEND_BLOB",
        "SUBMIT_BLOB",
    ],
        validate: async (runtime: IAgentRuntime) => {
        await validateCelestiaConfig(runtime);

        return true;
        },
    description: "Submit a blob to Celestia",
    handler: async (
        runtime: IAgentRuntime,
        memory: Memory,
        state: State,
        _options: { [key: string]: unknown },
        callback: HandlerCallback
    ): Promise<boolean> => {
        elizaLogger.log("Starting SUBMIT_BLOB handler...");

        try {
            // Initialize or update state
            state = state || (await runtime.composeState(memory)) as State;
            state = await runtime.updateRecentMessageState(state);

            // Generate submission content
            const submitBlobContext = composeContext({
                state,
                template: submitBlobTemplate,
            });
            const submitBlobContent = await generateObjectDeprecated({
                runtime,
                context: submitBlobContext,
                modelClass: ModelClass.SMALL,
            });

            if (!submitBlobContent?.data) {
                elizaLogger.log("No data to submit");
                if (callback) callback({ text: "No data to submit", content: {} });
                return false;
            }

            const submitBlobData = submitBlobContent.data;

            // Retrieve necessary configurations
            const CELESTIA_LIGHT_NODE_RPC_URL = runtime.getSetting("CELESTIA_LIGHT_NODE_RPC_URL");
            const CELESTIA_AI_AGENT_NAMESPACE = runtime.getSetting("CELESTIA_AI_AGENT_NAMESPACE");
            const CELESTIA_DEFAULT_TX_FEE = runtime.getSetting("CELESTIA_DEFAULT_TX_FEE");

            // Encode data to Base64
            const encodedData = await encodeDataToBase64String(submitBlobData);

            // Submit data to Celestia
            const celestiaResponse = await celestiaRequest(CELESTIA_LIGHT_NODE_RPC_URL, {
                method: "state.SubmitPayForBlob",
                params: [
                [
                    {
                    namespace_id: CELESTIA_AI_AGENT_NAMESPACE,
                    data: encodedData,
                    },
                ],
                {
                    gas_price: CELESTIA_DEFAULT_TX_FEE,
                    is_gas_price_set: true,
                },
                ],
            });

            elizaLogger.success(
                `Blob submitted successfully! Check it out on Celenium: ${await getCeleniumURL(celestiaResponse.result[0].tx_hash)}`
            );

            if (callback) {
                callback({
                text: `Blob submitted successfully! Check it out on Celenium: ${await getCeleniumURL(celestiaResponse.result[0].tx_hash)}`,
                content: {},
                });
            }

            return true;
        } catch (error) {
            elizaLogger.error("Error during blob submission:", error);

            if (callback)
                callback({ text: "Error during blob submission", content: { error: error.message } });

            return false;
        };
    },
    examples: [
        [
        {
            user: "{{user1}}",
            content: {
                text: "Submit the following data to Celestia 'Hello World!'",
            },
        },
        {
            user: "{{agent}}",
            content: {
                text: "Sure, I will send the data 'Hello World!' to Celestia now.",
                action: "SUBMIT_BLOB",
            },
        },
        {
            user: "{{agent}}",
            content: {
                text: "Blob submitted successfully! Check it out on Celenium: https://mocha-4.celenium.io/tx/6AA8D09F878A03FEB541AB035A55568068587F59D7350C8C34D55779B71D30A4",
            },
        },
        ],
        [
        {
            user: "{{user1}}",
            content: {
            text: "Submit 'Slow, big, ..., unstoppable' to Celestia",
            },
        },
        {
            user: "{{agent}}",
            content: {
                text: "Sure, I will send the data 'Slow, big, ..., unstoppable' to Celestia now.",
                action: "SUBMIT_BLOB",
            },
        },
        {
            user: "{{agent}}",
            content: {
                text: "Blob submitted successfully! Check it out on Celenium: https://mocha-4.celenium.io/tx/6AA8D09F878A03FEB541AB035A55568068587F59D7350C8C34D55779B71D30A4",
            },
        },
        ],
    ] as ActionExample[][],
} as Action;
