import { FC, useEffect, useState } from "react";
import { useAppSelector } from "@/hooks/useAppSelector";
import { selectInitializingWebContainerError } from "@/features/webcontainer/webcontainerSlice";
import Loader from "@/components/Loader";
import { isWebContainerSupported } from "@/utils/webcontainer";

const WebcontainerLoader: FC = () => {
  const webcontainerError = useAppSelector(selectInitializingWebContainerError);
  const [isBrowserSupported, setIsBrowserSupported] = useState(true);

  useEffect(() => {
    setIsBrowserSupported(isWebContainerSupported());
  }, []);

  if (webcontainerError || !isBrowserSupported)
    return (
      <div className="flex text-white m-4">
        <h1 className="self-center bg-red-700 p-4 rounded-lg">
          {webcontainerError}.
          <a
            className="link"
            href="https://developer.stackblitz.com/platform/webcontainers/browser-support"
            target="_blank"
          >
            Make sure your browser is setup correctly.
          </a>
        </h1>
      </div>
    );

  return (
    <Loader
      text="Installing packages"
      circleColor={"text-gray-400"}
      spinnerColor={"fill-white"}
    />
  );
};

export default WebcontainerLoader;
