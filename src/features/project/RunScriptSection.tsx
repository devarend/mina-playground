import { ChangeEvent, FC, useState } from "react";
import SelectList from "@/components/select/SelectList";
import Loader from "@/components/Loader";
import { FileNode, FileSystemTree } from "@webcontainer/api";
import { isEmpty } from "lodash";
import {
  selectInitializingEsbuild,
  writeCommand,
} from "@/features/webcontainer/webcontainerSlice";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { useAppSelector } from "@/hooks/useAppSelector";
import RunScriptButton from "@/components/terminal/RunScriptButton";

const getScripts = (fileSystemTree: FileSystemTree) => {
  if (!("package*json" in fileSystemTree)) return null;
  const parsedJSON = JSON.parse(
    (fileSystemTree["package*json"] as FileNode).file.contents as string
  );
  if (!("scripts" in parsedJSON) || isEmpty(parsedJSON.scripts)) return null;
  return parsedJSON.scripts;
};

const RunScriptSection: FC<RunScriptSectionProps> = ({ fileSystemTree }) => {
  const [script, setScript] = useState("");
  const dispatch = useAppDispatch();
  const isInitializing = useAppSelector(selectInitializingEsbuild);

  const abortTest = async () => {
    dispatch(writeCommand("\u0003"));
  };

  const runTest = async () => {
    dispatch(writeCommand(`npm run ${script} \r`));
  };

  const onChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setScript(event.target.value);
  };

  return (
    <div className="flex bg-black gap-2 items-center p-2">
      <SelectList
        title={"Choose a script"}
        items={getScripts(fileSystemTree)}
        onChange={onChange}
      />
      {isInitializing ? (
        <Loader
          text="Initializing"
          circleColor={"text-white"}
          spinnerColor={"fill-orange-500"}
        />
      ) : (
        <RunScriptButton
          disabled={!script}
          onRun={runTest}
          abortTitle={"Abort"}
          onAbort={abortTest}
          runTitle={"Run script"}
        />
      )}
    </div>
  );
};

interface RunScriptSectionProps {
  fileSystemTree: FileSystemTree;
}

export default RunScriptSection;
