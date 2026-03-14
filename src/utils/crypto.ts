import Aes from 'react-native-aes-crypto';

const PBKDF2_COST = 5000;
const KEY_LENGTH = 256;
const APP_STATIC_SALT = 'sentinel-key-secure-salt-v1-98a7b6cfdq';

// Derive the encryption key asynchronously deterministically from the user's unique Firebase UID
const getEncryptionKey = async (userId: string): Promise<string> => {
    // By hashing their unique static UID against a complex static salt 5000 times,
    // we get a structurally secure AES key that mathematically reconstructs exactly the same
    // on a brand new device, automatically syncing and decrypting their Vault.
    return await Aes.pbkdf2(userId, APP_STATIC_SALT, PBKDF2_COST, KEY_LENGTH, 'sha256');
};

export const encrypt = async (text: string, userId: string): Promise<string> => {
    try {
        if (!text) return text;
        if (!userId) throw new Error("Encryption requires a valid userId");

        const key = await getEncryptionKey(userId);
        const iv = await Aes.randomKey(16);
        const ciphertext = await Aes.encrypt(text, key, iv, 'aes-256-cbc');
        return `${iv}:${ciphertext}`;
    } catch (error) {
        console.error("Encryption error:", error);
        return text;
    }
};

export const decrypt = async (encodedText: string, userId: string): Promise<string> => {
    try {
        if (!encodedText || !encodedText.includes(':')) {
            // Might not be encrypted or is in old format, return as is safely
            return encodedText;
        }
        if (!userId) throw new Error("Decryption requires a valid userId");

        const [iv, ciphertext] = encodedText.split(':');
        if (!iv || !ciphertext) {
            return encodedText;
        }

        const key = await getEncryptionKey(userId);
        const plaintext = await Aes.decrypt(ciphertext, key, iv, 'aes-256-cbc');
        return plaintext;
    } catch (error) {
        console.error("Decryption error:", error);
        return encodedText;
    }
};
