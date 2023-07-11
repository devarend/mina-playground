import { FC } from "react";
import {
  ErrorIcon,
  SaveIcon,
  Spinner,
  SuccessIcon,
} from "@/icons/SaveCodeIcons";

const mapStatusToIconText = (
  isLoading: boolean,
  isSaved: boolean,
  isError: boolean
) => {
  if (isLoading) {
    return {
      text: "Saving...",
      Icon: <Spinner />,
    };
  }
  if (isSaved) {
    return {
      text: "Saved",
      Icon: <SuccessIcon />,
    };
  }
  if (isError) {
    return {
      text: "Retry",
      Icon: <ErrorIcon />,
    };
  }
  return {
    text: "Save",
    Icon: <SaveIcon />,
  };
};

const SaveCode: FC<SaveCodeProps> = ({
  disabled,
  isLoading,
  isSaved,
  isError,
  onClick,
}) => {
  const { text, Icon } = mapStatusToIconText(isLoading, isSaved, isError);
  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading || isSaved}
      type="button"
      className="text-gray-900 hover:text-white border border-gray-300 hover:bg-gray-900 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-1.5 text-center mr-2 inline-flex items-center disabled:opacity-50 disabled:pointer-events-none
"
    >
      {Icon}
      {text}
    </button>
  );
};

interface SaveCodeProps {
  disabled: boolean;
  isLoading: boolean;
  isSaved: boolean;
  isError: boolean;
  onClick(): void;
}

export default SaveCode;
