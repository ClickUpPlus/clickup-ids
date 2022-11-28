// Completely taken from https://explosion-scratch.github.io/blog/0-knowledge-auth/
// If I wrote this, I would have 0 braincells left

// @ts-ignore
const buff_to_base64 = (buff: Uint8Array) => btoa(String.fromCharCode.apply(null, buff));
// @ts-ignore
const base64_to_buf = (b64: string) => Uint8Array.from(atob(b64), (c) => c.charCodeAt(null));

const enc = new TextEncoder();
const dec = new TextDecoder();

const getPasswordKey = (password: string | undefined) =>
    crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, [
        "deriveKey",
    ]);

const deriveKey = (passwordKey: CryptoKey, salt: Uint8Array, keyUsage: string[]) =>
    crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt: salt,
            iterations: 100000,
            hash: "SHA-256",
        },
        passwordKey,
        {
            name: "AES-GCM",
            length: 256,
        },
        false,
        keyUsage
    );

export async function encrypt(secretData: string | undefined, password: string) {
    try {
        const salt = crypto.getRandomValues(new Uint8Array(16));
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const passwordKey = await getPasswordKey(password);
        const aesKey = await deriveKey(passwordKey, salt, ["encrypt"]);
        const encryptedContent = await crypto.subtle.encrypt(
            {
                name: "AES-GCM",
                iv: iv,
            },
            aesKey,
            enc.encode(secretData)
        );

        const encryptedContentArr = new Uint8Array(encryptedContent);
        let buff = new Uint8Array(
            salt.byteLength + iv.byteLength + encryptedContentArr.byteLength
        );
        buff.set(salt, 0);
        buff.set(iv, salt.byteLength);
        buff.set(encryptedContentArr, salt.byteLength + iv.byteLength);
        return buff_to_base64(buff);
    } catch (e) {
        console.log(`Error - ${e}`);
        return "";
    }
}

export async function decrypt(encryptedData: string, password: string | undefined) {
    const encryptedDataBuff = base64_to_buf(encryptedData);
    const salt = encryptedDataBuff.slice(0, 16);
    const iv = encryptedDataBuff.slice(16, 16 + 12);
    const data = encryptedDataBuff.slice(16 + 12);
    const passwordKey = await getPasswordKey(password);
    const aesKey = await deriveKey(passwordKey, salt, ["decrypt"]);
    const decryptedContent = await crypto.subtle.decrypt(
        {
            name: "AES-GCM",
            iv: iv,
        },
        aesKey,
        data
    );
    return dec.decode(decryptedContent);
}
