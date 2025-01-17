import Web3 from 'web3';
import Network from '@endpass/class/Network';
import keystoreHDWallet from '@endpass/utils/keystoreHDWallet';
import Signer from '@endpass/class/Signer';
import Wallet from '@/class/singleton/signer/Wallet';
import { setWeb3Network, web3 } from '@/class/singleton/signer/web3';
import i18n from '@/locales/i18n';

const { bytesToHex } = web3.utils;

export default {
  async validatePassword({ v3KeyStore, password }) {
    const wallet = new Wallet(v3KeyStore);
    const isPasswordValid = await wallet.validatePassword(password);

    return isPasswordValid;
  },

  async signDataWithAccount({ account, data, password }) {
    const wallet = new Wallet(account);
    const res = await wallet.sign(data, password);

    return res;
  },

  async recover({ seedPhrase, recoveryIdentifier }) {
    const hdWallet = keystoreHDWallet.createHDWalletBySeed(seedPhrase);
    const wallet = hdWallet.deriveChild(0).getWallet();
    const privateKey = bytesToHex(wallet.getPrivateKey());
    const web3Recover = new Web3(
      Network.NETWORK_URL_HTTP[Network.NET_ID.MAIN][0],
    );
    const correctPrivateKey = Signer.privateKeyToStr(privateKey);
    const { signature } = await web3Recover.eth.accounts.sign(
      recoveryIdentifier,
      correctPrivateKey,
    );
    return signature;
  },

  async recoverMessage({ account, request, net }) {
    setWeb3Network(net);

    const wallet = new Wallet(account);
    const res = await wallet.recover(request.params[0], request.params[1]);
    return res;
  },

  async getSignedRequest({ v3KeyStore, request, password, net }) {
    setWeb3Network(net);

    const wallet = new Wallet(v3KeyStore);

    switch (request.method) {
      case 'eth_sendTransaction':
        return wallet.sendSignedTransaction(request.params[0], password);

      case 'eth_signTypedData':
        // const wallet = rootGetters['accounts/wallet'];
        // const request = getters.currentRequest;
        throw new Error(i18n.t('services.signer.typedData'));

      default:
        // eslint-disable-next-line
        const { signature } = await wallet.sign(request.params[0], password);
        return signature;
    }
  },

  setWeb3Network,
  getWeb3Instance() {
    return web3;
  },
};
