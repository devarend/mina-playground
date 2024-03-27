import { FC } from "react";

const Steps: FC<StepsProps> = ({ items, stepIndex }) => {
  return (
    <ul className="steps text-gray-200">
      {items.map((item, index) => (
        <li className={`step ${index < stepIndex && "step-success"}`}>
          {item}
        </li>
      ))}
    </ul>
  );
};

interface StepsProps {
  items: string[];
  stepIndex: number;
}

export default Steps;
