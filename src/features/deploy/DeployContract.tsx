import { FC } from "react";
import Button from "@/components/button/Button";
import { deploySmartContract } from "@/features/webcontainer/webcontainerSlice";
import { useAppDispatch } from "@/hooks/useAppDispatch";

export const DeployContract: FC<DeployContractProps> = ({}) => {
  const dispatch = useAppDispatch();
  const deploy = async () => {
    const compiledPath = `build/src/main.js`;
    dispatch(
      deploySmartContract({
        path: compiledPath,
      })
    );
  };
  return (
    <>
      {/*<h1>Deploy contract</h1>*/}
      <Button onClick={deploy}>Deploy contract</Button>
    </>
  );
};

interface DeployContractProps {}
