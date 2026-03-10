/**
 * CryptoUtils - Client-side data protection
 * 
 * Implements two layers of protection:
 * 1. AES-GCM (Web Crypto API) - Strong asynchronous encryption for sensitive data.
 * 2. XOR + Base64 - Lightweight synchronous obfuscation to prevent casual editing.
 */

// A fixed salt/key for this deployment (obfuscated in the bundle)
// In a real production app, this would be derived from a user-specific secret or device ID
const SECRET_SEED = 'w3bp0ng_neural_link_2026';

/**
 * Lightweight synchronous obfuscation
 * Prevents casual JSON editing in DevTools
 */
export function obfuscate(data: string): string {
  const result = [];
  for (let i = 0; i < data.length; i++) {
    result.push(String.fromCharCode(data.charCodeAt(i) ^ SECRET_SEED.charCodeAt(i % SECRET_SEED.length)));
  }
  return btoa(encodeURIComponent(result.join('')));
}

/**
 * Lightweight synchronous de-obfuscation
 */
export function deobfuscate(data: string): string {
  try {
    const decoded = decodeURIComponent(atob(data));
    const result = [];
    for (let i = 0; i < decoded.length; i++) {
      result.push(String.fromCharCode(decoded.charCodeAt(i) ^ SECRET_SEED.charCodeAt(i % SECRET_SEED.length)));
    }
    return result.join('');
  } catch (e) {
    console.error('Deobfuscation failed - data may be corrupted or in old format');
    return data; // Fallback to raw data
  }
}

/**
 * Strong Asynchronous Encryption (AES-GCM)
 */
export async function encrypt(data: string): Promise<string> {
  try {
    const encoder = new TextEncoder();
    const encodedData = encoder.encode(data);
    
    // Generate a random IV
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    // Create a key from the secret seed
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(SECRET_SEED),
      { name: 'PBKDF2' },
      false,
      ['deriveBits', 'deriveKey']
    );
    
    const key = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: encoder.encode('w3bp0ng_salt'),
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt']
    );
    
    const encryptedContent = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encodedData
    );
    
    // Combine IV and encrypted content
    const combined = new Uint8Array(iv.length + encryptedContent.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encryptedContent), iv.length);
    
    // Return as Base64
    return btoa(String.fromCharCode(...combined));
  } catch (e) {
    console.error('Encryption failed:', e);
    return obfuscate(data); // Fallback to obfuscation
  }
}

/**
 * Strong Asynchronous Decryption (AES-GCM)
 */
export async function decrypt(encryptedBase64: string): Promise<string> {
  try {
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    
    const combined = Uint8Array.from(atob(encryptedBase64), c => c.charCodeAt(0));
    const iv = combined.slice(0, 12);
    const encryptedContent = combined.slice(12);
    
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(SECRET_SEED),
      { name: 'PBKDF2' },
      false,
      ['deriveBits', 'deriveKey']
    );
    
    const key = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: encoder.encode('w3bp0ng_salt'),
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['decrypt']
    );
    
    const decryptedContent = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      encryptedContent
    );
    
    return decoder.decode(decryptedContent);
  } catch (e) {
    console.warn('Strong decryption failed, trying obfuscation fallback:', e);
    return deobfuscate(encryptedBase64);
  }
}
