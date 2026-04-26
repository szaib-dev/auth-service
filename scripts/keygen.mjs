import fs from 'fs';
import crypto from 'crypto';

const certsDir = 'certs';

//it will check does directly exists or not if not it will create otherwise it will skip this.
if (!fs.existsSync(certsDir)) {
    fs.mkdirSync(certsDir, { recursive: true });
}

const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    privateKeyEncoding: {
        format: 'pem',
        type: 'pkcs1',
    },
    publicKeyEncoding: {
        format: 'pem',
        type: 'pkcs1',
    },
});

fs.writeFileSync(`${certsDir}/privateKey.pem`, privateKey);
fs.writeFileSync(`${certsDir}/publicKey.pem`, publicKey);
