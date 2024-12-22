import { Plugin } from "@elizaos/core";

import submitBlob from "./actions/submitBlob.js";

export const celestiaPlugin: Plugin = {
    name: "celestia",
    description: "Celestia DA integration plugin",
    providers: [],
    evaluators: [],
    services: [],
    actions: [submitBlob]
};

export default celestiaPlugin;
