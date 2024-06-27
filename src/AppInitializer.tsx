import { useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { setClientPrivateKey, setClientPublicKey, setServerPublicKey } from './features/appSlice';
import { axiosInstance } from './utils/axios';
import { encryptData } from './utils/encryption';
import { showToastMessage } from './utils/helpers';
import forge from "node-forge";

const AppInitializer = ({ children,onInitialized }:any) => {
  const dispatch = useDispatch();

  async function generateRSAKeyPair() {
    return new Promise((resolve, reject) => {
      forge.pki.rsa.generateKeyPair({ bits: 2048 }, (err, keyPair) => {
        if (err) {
          reject(err);
        } else {
          resolve(keyPair);
        }
      });
    });
  }
function exportPublicKeyAsPEM(publicKey:any) {
  const pem = forge.pki.publicKeyToPem(publicKey);
  return pem;
}

function exportPrivateKeyAsPEM(privateKey:any) {
  const pem = forge.pki.privateKeyToPem(privateKey);
  return pem;
}

  useMemo(() => {
    const initializeApp = async () => {
      try {
        const keyPair:any = await generateRSAKeyPair();
          const publicKey = keyPair.publicKey;
          const privateKey = keyPair.privateKey;
          const pemPublicKey = exportPublicKeyAsPEM(publicKey);
          const pemPrivateKey = exportPrivateKeyAsPEM(privateKey);
          dispatch(setClientPrivateKey(pemPrivateKey));
          dispatch(setClientPublicKey(pemPublicKey));
          const response = await axiosInstance.post(`handshake`, { publicKey: pemPublicKey });
          const serverPublicKey = response.data.serverPublicKey;
          const CsrfToken = response.data.csrfToken;
          localStorage.setItem('X-VALIDATE', encryptData(CsrfToken));
          dispatch(setServerPublicKey(serverPublicKey));
          onInitialized()
      
        } catch (error) {
          showToastMessage("App initialization error",'error')
          onInitialized()
        }
    };

    initializeApp();
  }, [dispatch]);

  return <>{children}</>;
};

export default AppInitializer;