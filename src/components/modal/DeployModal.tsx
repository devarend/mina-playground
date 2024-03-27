import { FC, useEffect, useRef, useState } from "react";
import Button from "@/components/button/Button";
import { useAppSelector } from "@/hooks/useAppSelector";
import {
  deploySmartContract,
  selectDeploymentMessage,
  selectIsDeploying,
} from "@/features/webcontainer/webcontainerSlice";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import CTAModal from "@/components/modal/CTAModal";
import { KeyIcon } from "@/icons/DeployIcons";
import SelectList from "@/components/select/SelectList";
import { Remote, wrap } from "comlink";
import { normalizePath } from "@/utils/fileSystemWeb";
import { Faucet } from "@/features/deploy/Faucet";
interface o1jsWorker {
  generateKeys(
    customKeyValue: string | undefined
  ): Promise<{ publicKey: string; privateKey: string }>;
}

const DeployModal: FC<DeployModalProps> = ({
  isVisible,
  close,
  results,
  path,
}) => {
  const isDeploying = useAppSelector(selectIsDeploying);
  const deploymentMessage = useAppSelector(selectDeploymentMessage);
  const dispatch = useAppDispatch();
  const [keys, setKeys] = useState<{
    publicKey: string;
    privateKey: string;
    isValid: boolean | null;
  }>({
    publicKey: "",
    privateKey: "",
    isValid: null,
  });
  const [isInitializing, setIsInitializing] = useState(false);
  const webWorker = useRef<any>();
  const generate = useRef<o1jsWorker>();

  useEffect(() => {
    return () => webWorker.current?.terminate();
  }, []);

  const deployProject = async () => {
    const compiledPath = `build/${path.replace("*ts", ".js")}`;
    dispatch(
      deploySmartContract({
        path: normalizePath(compiledPath),
        feePayerKey: keys.privateKey,
      })
    );
  };

  const generateKeys = async (customKeyValue?: string) => {
    if (customKeyValue === "") {
      setKeys({ ...keys, privateKey: "", isValid: false });
      return;
    }
    if (!webWorker.current) {
      setIsInitializing(true);
      webWorker.current = new Worker(
        new URL("../../webworkers/worker.ts", import.meta.url)
      );
      const workerReady = () =>
        new Promise<void>(
          (resolve) =>
            (webWorker.current.onmessage = (e) =>
              e.data === "isReady" && resolve())
        );
      await workerReady();
      generate.current = wrap<o1jsWorker>(webWorker.current);
    }
    const workerFunctions = generate.current;
    if (!workerFunctions) return;
    try {
      const { publicKey, privateKey } = await workerFunctions.generateKeys(
        customKeyValue
      );
      setKeys({ publicKey, privateKey, isValid: true });
    } catch (e) {
      setKeys({ ...keys, privateKey: customKeyValue || "", isValid: false });
    }
    setIsInitializing(false);
  };

  return (
    <CTAModal id="deployModal" isVisible={isVisible} close={close}>
      <div className="text-gray-200">
        <h3 className="text-lg font-bold">Deploy Smart Contract</h3>
        <p className="py-2">Choose a Smart Contract</p>
        {deploymentMessage && (
          <div className="alert alert-success">
            <KeyIcon />
            <span>{deploymentMessage.message}</span>
          </div>
        )}
        <SelectList
          title={"Choose a Smart Contract"}
          items={results.map((item) => item[1])}
          onChange={() => null}
        />
        {keys.privateKey && keys.isValid && (
          <Faucet publicKey={keys.publicKey} />
        )}
        <div>
          <label htmlFor="hs-trailing-button-add-on" className="sr-only">
            Label
          </label>
          <div className="flex rounded-md shadow-sm gap-2">
            <input
              value={keys.privateKey}
              onChange={(evt) => generateKeys(evt.target.value)}
              type="text"
              id="hs-trailing-button-add-on"
              name="hs-trailing-button-add-on"
              placeholder="Fee payer private key"
              className="py-3 px-4 block w-full bg-gray-700 shadow-sm rounded-l-md text-sm focus:z-10 focus:border-blue-500 focus:ring-blue-500"
            />
            <Button
              isLoading={isInitializing}
              onClick={() => generateKeys()}
              className="bg-gray-500 text-white hover:bg-gray-600"
            >
              <svg
                className="w-4 h-4"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 512 512"
              >
                <path
                  fill="white"
                  d="M336 352c97.2 0 176-78.8 176-176S433.2 0 336 0S160 78.8 160 176c0 18.7 2.9 36.8 8.3 53.7L7 391c-4.5 4.5-7 10.6-7 17v80c0 13.3 10.7 24 24 24h80c13.3 0 24-10.7 24-24V448h40c13.3 0 24-10.7 24-24V384h40c6.4 0 12.5-2.5 17-7l33.3-33.3c16.9 5.4 35 8.3 53.7 8.3zM376 96a40 40 0 1 1 0 80 40 40 0 1 1 0-80z"
                />
              </svg>
              Generate
            </Button>
          </div>
          {keys.isValid === false && (
            <span className="text-red-500">
              Please use a correct private key
            </span>
          )}
        </div>
        <div className="modal-action">
          <Button
            isLoading={isDeploying}
            onClick={deployProject}
            className="btn-dark"
          >
            Deploy Smart Contract
          </Button>
        </div>
      </div>
    </CTAModal>
  );
};

interface DeployModalProps {
  isVisible: boolean;
  results: RegExpMatchArray[];
  path: string;
  close(): void;
}

export default DeployModal;
