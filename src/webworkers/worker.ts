import { expose } from "comlink";

const MinaWorker = async () => {
  const { PrivateKey } = await import("o1js");
  return {
    generateKeys: async (customKeyValue: string | undefined) => {
      const key = customKeyValue
        ? PrivateKey.fromBase58(customKeyValue)
        : PrivateKey.random();
      const publicKey = key.toPublicKey().toBase58();
      const privateKey = key.toBase58();
      return { publicKey, privateKey };
    },
  };
};

// @ts-ignore
const worker = await MinaWorker();
expose(worker);
postMessage("ready");
