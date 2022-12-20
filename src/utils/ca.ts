import { str2ab } from '@/utils/index';

export async function importPrivKey(pemContents: string): Promise<CryptoKey> {
  // base64 decode the string to get the binary data
  const binaryDerString = atob(pemContents);
  // convert from a binary string to an ArrayBuffer
  const binaryDer = str2ab(binaryDerString);

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
