/**
 * Simple Base64 encryption placeholder using a more compatible implementation for React Native.
 * WARNING: This is NOT secure for production use.
 * Recommend using react-native-aes-crypto or crypto-js for real encryption.
 */

// Helper function for Base64 encoding (btoa alternative)
const base64Encode = (str: string): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    let output = '';
    for (let i = 0; i < str.length; i += 3) {
        const char1 = str.charCodeAt(i);
        const char2 = i + 1 < str.length ? str.charCodeAt(i + 1) : NaN;
        const char3 = i + 2 < str.length ? str.charCodeAt(i + 2) : NaN;

        const byte1 = char1 >> 2;
        const byte2 = ((char1 & 3) << 4) | (char2 >> 4);
        const byte3 = ((char2 & 15) << 2) | (char3 >> 6);
        const byte4 = char3 & 63;

        output += chars.charAt(byte1) + chars.charAt(byte2) +
            (isNaN(char2) ? '=' : chars.charAt(byte3)) +
            (isNaN(char3) ? '=' : chars.charAt(byte4));
    }
    return output;
};

// Helper function for Base64 decoding (atob alternative)
const base64Decode = (str: string): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    let output = '';
    str = str.replace(/=+$/, '');
    for (let i = 0; i < str.length; i += 4) {
        const byte1 = chars.indexOf(str.charAt(i));
        const byte2 = chars.indexOf(str.charAt(i + 1));
        const byte3 = i + 2 < str.length ? chars.indexOf(str.charAt(i + 2)) : 0;
        const byte4 = i + 3 < str.length ? chars.indexOf(str.charAt(i + 3)) : 0;

        const char1 = (byte1 << 2) | (byte2 >> 4);
        const char2 = ((byte2 & 15) << 4) | (byte3 >> 2);
        const char3 = ((byte3 & 3) << 6) | byte4;

        output += String.fromCharCode(char1);
        if (i + 2 < str.length || byte3 !== 0) output += String.fromCharCode(char2);
        if (i + 3 < str.length || byte4 !== 0) output += String.fromCharCode(char3);
    }
    return output;
};

export const encrypt = (text: string): string => {
    try {
        return base64Encode(text);
    } catch (error) {
        console.error("Encryption error:", error);
        return text;
    }
};

export const decrypt = (encodedText: string): string => {
    try {
        return base64Decode(encodedText);
    } catch (error) {
        console.error("Decryption error:", error);
        return encodedText;
    }
};
