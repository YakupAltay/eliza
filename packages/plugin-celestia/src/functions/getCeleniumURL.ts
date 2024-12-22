async function getCeleniumURL(txHash: string): Promise<string> {
    return `https://mocha-4.celenium.io/tx/${txHash}`;
}

export default getCeleniumURL;
