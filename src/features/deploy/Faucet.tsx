import { FC, useEffect, useState } from "react";
import Button from "@/components/button/Button";
import {
  useCheckTransactionQuery,
  useFaucetRequestMutation,
} from "@/services/minaPlayground";
import { KeyIcon } from "@/icons/DeployIcons";
import Loader from "@/components/Loader";

export const Faucet: FC<FaucetProps> = ({ publicKey }) => {
  const [skip, setSkip] = useState(true);
  const [faucetRequest, { isLoading, isSuccess, isError, data }] =
    useFaucetRequestMutation();

  const { data: transactionData } = useCheckTransactionQuery(
    data?.message?.paymentID,
    {
      skip,
      pollingInterval: 20000,
    }
  );

  const onFaucetClick = async () => {
    faucetRequest({
      body: { address: publicKey },
    });
  };

  const successfulFaucetTransaction = transactionData?.isCanonical;

  useEffect(() => {
    if (!data?.message?.paymentID) return;
    setSkip(false);
  }, [data?.message?.paymentID]);

  useEffect(() => {
    if (!successfulFaucetTransaction) return;
    setSkip(true);
  }, [successfulFaucetTransaction]);

  if (isError) {
    return (
      <div className="alert alert-error">
        <KeyIcon />
        <span className="text-sm">
          Something went from while requesting the faucet. Please try again or
          use another wallet address.
        </span>
      </div>
    );
  }

  if (successfulFaucetTransaction) {
    return (
      <div className="alert alert-success text-white">
        <KeyIcon />
        <div>
          <span className="text-sm">Your account has now been funded.</span>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="alert alert-info text-white">
        <KeyIcon />
        <div>
          <span className="text-sm">
            Testnet Mina will arrive at your address when the next block is
            produced (~3 min).
            <br />
            <a
              className="underline"
              href={`https://minascan.io/berkeley/tx/${data.message.paymentID}`}
              target="_blank"
            >
              View your transaction
            </a>
          </span>
        </div>
        <div className="flex flex-col">
          <Loader
            text="Waiting for transaction"
            circleColor={"text-white"}
            spinnerColor={"fill-black"}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="alert mb-2 bg-gray-300 text-black">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        className="stroke-current shrink-0 w-6 h-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <span className="text-sm">
        Make sure to use the faucet if your address does not have any funds
      </span>
      <div>
        <Button isLoading={isLoading} onClick={onFaucetClick}>
          Faucet
        </Button>
      </div>
    </div>
  );
};

interface FaucetProps {
  publicKey: string;
}
