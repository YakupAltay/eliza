export default async (data: string): Promise<string> => {
    try {
        const dataString = JSON.stringify(data);
        const encodedData = Buffer.from(dataString).toString('base64');
        return encodedData;
    } catch (error: any) {
        throw new Error(error.toString());
    }
};
