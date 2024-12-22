import { exec } from 'child_process';
import { promisify } from 'util';

const GET_AUTH_KEY_COMMAND: string = `
    docker exec zkvote-node-celestia bash -c 'celestia $NODE_TYPE auth admin --p2p.network $CHAIN_ID'
`;

// Promisify the exec function
const execAsync = promisify(exec);

export default async (): Promise<string> => {
    try {
        const { stdout } = await execAsync(GET_AUTH_KEY_COMMAND);
        return stdout.trim();
    } catch {
        throw new Error('terminal_error');
    }
};
