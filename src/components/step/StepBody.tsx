import { FC } from "react";

const StepBody: FC<StepBodyProps> = ({ items, stepIndex }) => {
  const { Component, props } = items[stepIndex - 1];
  return <Component {...props} />;
};

interface StepBodyProps {
  items: { Component: FC<any>; props: object }[];
  stepIndex: number;
}

export default StepBody;
