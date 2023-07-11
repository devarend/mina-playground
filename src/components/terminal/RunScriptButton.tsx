import { FC } from "react";
import { useAppSelector } from "@/hooks/useAppSelector";
import {
  selectIsAborting,
  selectIsRunning,
} from "@/features/webcontainer/webcontainerSlice";

const RunScriptButton: FC<RunScriptButtonProps> = ({
  runTitle,
  abortTitle,
  onAbort,
  onRun,
  disabled = false,
}) => {
  const isRunning = useAppSelector(selectIsRunning);
  const isAborting = useAppSelector(selectIsAborting);

  const onClick = isRunning ? onAbort : onRun;
  const { style, title } = isRunning
    ? { style: "from-red-400 via-red-500 to-red-600", title: abortTitle }
    : {
        style: "from-green-400 via-green-500 to-green-600",
        title: runTitle,
      };
  return (
    <button
      disabled={disabled}
      type="button"
      onClick={onClick}
      className={`inline-flex w-36 text-white bg-gradient-to-r ${style} disabled:opacity-50 disabled:pointer-events-none

        } hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center`}
    >
      {isRunning || isAborting ? (
        isAborting ? (
          <AbortSpinner />
        ) : (
          <AbortSquare />
        )
      ) : (
        <RunIcon />
      )}
      {title}
    </button>
  );
};

const AbortSpinner = () => (
  <svg
    aria-hidden="true"
    className={`w-5 h-5 mr-2 text-white animate-spin fill-black`}
    viewBox="0 0 100 101"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
      fill="currentColor"
    />
    <path
      d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
      fill="currentFill"
    />
  </svg>
);

const AbortSquare = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 448 512"
    className="w-5 h-5 mr-2 "
  >
    <path
      d="M0 96C0 60.7 28.7 32 64 32H384c35.3 0 64 28.7 64 64V416c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V96z"
      fill="#FFF"
    />
  </svg>
);

const RunIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 384 512"
    className="w-5 h-5 mr-2 "
  >
    <path
      fill="#FFF"
      d="M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80V432c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9L361 297c14.3-8.7 23-24.2 23-41s-8.7-32.2-23-41L73 39z"
    />
  </svg>
);

interface RunScriptButtonProps {
  runTitle: string;
  abortTitle: string;
  disabled?: boolean;

  onAbort(): void;

  onRun(): void;
}

export default RunScriptButton;
