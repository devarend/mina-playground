import { FC, useEffect, useState } from "react";
import CodeEditor from "@/components/editor/CodeEditor";
import SaveCode from "@/components/editor/SaveCode";
import { useAppSelector } from "@/hooks/useAppSelector";
import { selectWebcontainerInstance } from "@/features/webcontainer/webcontainerSlice";
import { useUpdateFileTreeMutation } from "@/services/fileTree";
import {
  selectChangedFields,
  selectCurrentTreeItem,
  setChangedFields,
} from "@/features/fileTree/fileTreeSlice";
import { useAppDispatch } from "@/hooks/useAppDispatch";

const CodeEditorWithSave: FC<CodeEditorWithSaveProps> = ({ id }) => {
  const { currentDirectory: directory, code: treeItemCode } = useAppSelector(
    selectCurrentTreeItem
  );
  const changedFields = useAppSelector(selectChangedFields);
  const dispatch = useAppDispatch();
  const [code, setCode] = useState<string | undefined>("");
  const webcontainerInstance = useAppSelector(selectWebcontainerInstance);
  const [updateFileTree, { isLoading, isError }] = useUpdateFileTreeMutation();

  const setCodeChange = async (code: string | undefined) => {
    if (!code) return;
    setCode(code);
    dispatch(setChangedFields({ location: directory.webcontainerPath, code }));
  };

  useEffect(() => {
    const changedStoredCode = changedFields[directory.webcontainerPath]?.code;
    setCode(changedStoredCode || treeItemCode);
  }, [treeItemCode]);

  const changedField = changedFields[directory.webcontainerPath];
  const isSaved = changedField?.saved;

  const save = async () => {
    const body = { location: directory.webcontainerPath, code };
    updateFileTree({
      id: id,
      body,
    });
    webcontainerInstance?.fs.writeFile(
      directory.path.replace(/\*/g, "."),
      code || ""
    );
  };

  return (
    <>
      {directory.path && (
        <>
          {" "}
          <div className="flex bg-gray-50 items-center p-2">
            <SaveCode
              disabled={!changedField}
              onClick={save}
              isLoading={isLoading}
              isSaved={isSaved}
              isError={isError}
            />
          </div>
          <CodeEditor code={code} setCodeChange={setCodeChange} />
        </>
      )}
    </>
  );
};

interface CodeEditorWithSaveProps {
  id: string;
}

export default CodeEditorWithSave;
