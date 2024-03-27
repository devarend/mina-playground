import { FC, useState } from "react";
import { UploadIcon } from "@/icons/DeployIcons";
import DeployModal from "@/components/modal/DeployModal";
import * as React from "react";

export const Deploy: FC<DeployProps> = ({ results, path }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  return (
    <>
      <button
        onClick={() => setIsModalVisible(true)}
        type="button"
        className="text-gray-200 hover:text-white hover:bg-black focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-1.5 text-center mr-2 inline-flex items-center disabled:opacity-50 disabled:pointer-events-none
"
      >
        <UploadIcon />
        Deploy
      </button>
      <DeployModal
        path={path}
        results={results}
        isVisible={isModalVisible}
        close={() => setIsModalVisible(false)}
      />
    </>
  );
};

interface DeployProps {
  results: RegExpMatchArray[];
  path: string;
}
