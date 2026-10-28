/** Identical SHA-256 in HTTPS and HTTP-only local lab previews; never weakens integrity to skip verification. */
export async function foundryDigest(bytes:Uint8Array,preferNative=true):Promise<string>{
 const hash=preferNative&&globalThis.crypto?.subtle?new Uint8Array(await crypto.subtle.digest('SHA-256',bytes as Uint8Array<ArrayBuffer>)):(await import('@noble/hashes/sha2.js')).sha256(bytes);
 return Array.from(hash,n=>n.toString(16).padStart(2,'0')).join('');
}
