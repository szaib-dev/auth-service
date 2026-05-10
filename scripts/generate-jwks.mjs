import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const rootDir = process.cwd();
const certPath = path.join(rootDir, 'certs', 'publicKey.pem');
const outputDir = path.join(rootDir, 'public', '.well-known');
const outputPath = path.join(outputDir, 'jwks.json');

if (!fs.existsSync(certPath)) {
    throw new Error(`Public key not found at ${certPath}`);
}

const publicKeyPem = fs.readFileSync(certPath, 'utf8');
const publicKey = crypto.createPublicKey(publicKeyPem);
const jwk = publicKey.export({ format: 'jwk' });

const kid = crypto
    .createHash('sha256')
    .update(`${jwk.n}.${jwk.e}`)
    .digest('base64url');

const jwks = {
    keys: [
        {
            ...jwk,
            use: 'sig',
            alg: 'RS256',
            kid,
        },
    ],
};

fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify(jwks, null, 4));

console.log(`JWKS written to ${outputPath}`);
