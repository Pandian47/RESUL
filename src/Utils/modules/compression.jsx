import lz4 from 'lz4js';
import * as pako from 'pako';

export class CompressionManager {
    static compress(data, method = 'none') {
        if (method === 'none') return JSON.stringify(data);

        const jsonData = JSON.stringify(data);
        const encodedData = new TextEncoder().encode(jsonData);

        switch (method) {
            case 'lz4':
                return lz4.compress(encodedData);

            case 'zlib': {
                const compressed = pako.deflate(encodedData);
                const base64Data = btoa(String.fromCharCode.apply(null, Array.from(compressed)));
                return base64Data;
            }

            case 'lzma':
                return pako.deflate(jsonData, { level: 9 });

            default:
                return jsonData;
        }
    }

    static base64ToUint8Array(base64) {
        const binaryString = atob(base64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes;
    }

    static decompress(data, method = 'none') {

        if (method === 'none') {
            if (data == null || data === '') return null;
            return JSON.parse(data);
        }

        try {
            let decompressedData;

            switch (method) {
                case 'lz4': {
                    const lz4Decoded = lz4.decompress(data);
                    decompressedData = new TextDecoder().decode(lz4Decoded);
                    break;
                }

                case 'zlib':
                case 'lzma': {
                    const byteData = typeof data === 'string' ? CompressionManager.base64ToUint8Array(data) : data;

                    decompressedData = new TextDecoder().decode(pako.inflate(byteData));
                    break;
                }

                default:
                    return JSON.parse(data);
            }

            return JSON.parse(decompressedData);
        } catch (error) {
            return null;
        }
    }
}
