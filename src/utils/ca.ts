import { str2ab } from '@/utils/index';

const xorBuffer = (a: ArrayBuffer, key: ArrayBuffer) => {
  const a8 = new Uint8Array(a);
  const key8 = new Uint8Array(key);
  for (let i = 0; i < a.byteLength; i += 1) a8[i] ^= key8[i];
};

const getXorKey = async (password: string, length: number) => {
  const baseKey = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  // length for PBKDF2 key derivation must be a multiple of 8 bits
  const key = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: str2ab('\x8doSl\x13h\x15B2\x16\x8d.\xac-O\x96'),
      iterations: 1926,
      hash: 'SHA-256',
    },
    baseKey,
    length * 8
  );
  return key.slice(0, length);
};

export async function importPrivKey(pemContents: string, password: string): Promise<CryptoKey> {
  // base64 decode the string to get the binary data
  const binaryDerString = atob(pemContents);
  // convert from a binary string to an ArrayBuffer
  const binaryDer = str2ab(binaryDerString);
  // decrypt using password
  xorBuffer(binaryDer, await getXorKey(password, binaryDer.byteLength));

  return await crypto.subtle.importKey(
    'pkcs8',
    binaryDer,
    {
      name: 'ECDSA',
      namedCurve: 'P-256',
    },
    true,
    ['sign']
  );
}

export const idToCAUid = (id: string) => {
  return 'BANK_' + id;
};

export async function getPubKey(privKey: CryptoKey): Promise<CryptoKey> {
  const jwkPrivate = await crypto.subtle.exportKey('jwk', privKey);
  delete jwkPrivate.d;
  jwkPrivate.key_ops = ['verify'];
  return await crypto.subtle.importKey(
    'jwk',
    jwkPrivate,
    { name: 'ECDSA', namedCurve: 'P-256' },
    true,
    ['verify']
  );
}

export const pemHeader = '-----BEGIN PRIVATE KEY-----\n';
export const pemFooter = '\n-----END PRIVATE KEY-----';

export function validatePrivKey(privKey: string): boolean {
  if (privKey.indexOf(pemHeader) === -1 || privKey.indexOf(pemFooter) === -1) {
    return false;
  }
  return true;
}

export const generateKey = async () => {
  return await crypto.subtle.generateKey(
    {
      name: 'ECDSA',
      namedCurve: 'P-256',
    },
    true,
    ['sign', 'verify']
  );
};
