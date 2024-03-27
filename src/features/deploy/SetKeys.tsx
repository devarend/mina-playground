import { FC, useRef, useState } from "react";
import Button from "@/components/button/Button";
import { wrap } from "comlink";
import Input from "@/components/input/Input";
import * as React from "react";
import { o1jsWorker } from "@/types";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { setPrivateKey } from "@/features/webcontainer/webcontainerSlice";
import { Faucet } from "@/features/deploy/Faucet";

export const SetKeys: FC<SetKeysProps> = ({ onNextClick }) => {
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
              e.data === "ready" && resolve())
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

  const onClick = () => {
    dispatch(setPrivateKey(keys.privateKey));
    onNextClick();
  };

  return (
    <>
      {keys.privateKey && keys.isValid && <Faucet publicKey={keys.publicKey} />}
      <div className="flex items-center rounded-md shadow-sm gap-2">
        <Input
          value={keys.privateKey}
          placeholder={"Key"}
          onChange={(value) => generateKeys(value)}
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
        {keys.isValid === false && (
          <span className="text-red-500">Please use a correct private key</span>
        )}
      </div>
      <Button disabled={!keys.isValid} onClick={onClick}>
        Next
      </Button>
    </>
  );
};

interface SetKeysProps {
  onNextClick(): void;
}
