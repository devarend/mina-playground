import { FC, useState } from "react";
import Steps from "@/components/step/Steps";
import StepBody from "@/components/step/StepBody";
import * as React from "react";
import { AddContract } from "@/features/deploy/AddContract";
import { SetKeys } from "@/features/deploy/SetKeys";
import { DeployContract } from "@/features/deploy/DeployContract";
import { useAppSelector } from "@/hooks/useAppSelector";
import { selectInitializingEsbuild } from "@/features/webcontainer/webcontainerSlice";
import WebcontainerLoader from "@/features/webcontainer/WebcontainerLoader";

export const Deploy: FC<DeployProps> = ({ code }) => {
  const [stepIndex, setStepIndex] = useState(1);
  const initializingWebcontainer = useAppSelector(selectInitializingEsbuild);

  const onNextClick = () => {
    if (stepIndex === 3) return;
    setStepIndex((prevIndex) => prevIndex + 1);
  };

  if (initializingWebcontainer) {
    return (
      <div className={`flex justify-center`}>
        <WebcontainerLoader message="Initializing deployment" />
      </div>
    );
  }
  return (
    <div className="flex flex-col justify-center gap-4 p-4">
      <Steps
        items={["Add Contract", "Set keys", "Deploy"]}
        stepIndex={stepIndex}
      />
      <StepBody
        items={[
          { Component: AddContract, props: { onNextClick, code } },
          { Component: SetKeys, props: { onNextClick } },
          { Component: DeployContract, props: {} },
        ]}
        stepIndex={stepIndex}
      />
    </div>
  );
};

interface DeployProps {
  code?: string;
}
