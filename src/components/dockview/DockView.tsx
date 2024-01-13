import {
  DockviewReact,
  GridviewReact,
  GridviewReadyEvent,
  IDockviewPanelProps,
  IGridviewPanelProps,
  IPaneviewPanelProps,
  PanelCollection,
  PaneviewReact,
} from "dockview";
import * as React from "react";
import ProjectFileExplorer from "@/features/project/ProjectFileExplorer";
import CodeEditorWithSave from "@/features/project/CodeEditorWithSave";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { setDockApi } from "@/features/dockView/dockViewSlice";
import Section from "@/components/section/Section";
import SectionItem from "@/components/section/SectionItem";
import ProjectTerminal from "@/components/terminal/ProjectTerminal";

const GetStarted = () => {
  return (
    <Section>
      <SectionItem />
    </Section>
  );
};

const DockView = ({ id }: { id: string }) => {
  const onReady = (event: GridviewReadyEvent) => {
    event.api.addPanel({
      id: "dock",
      component: "dock",
    });

    event.api.addPanel({
      id: "panes",
      component: "panes",
      maximumWidth: 800,
      minimumWidth: 150,
      size: 300,
      position: {
        direction: "left",
        referencePanel: "dock",
      },
      params: { id },
    });

    event.api.addPanel({
      id: "terminal",
      component: "terminal",
      minimumHeight: 100,
      size: 150,
      position: {
        direction: "below",
        referencePanel: "dock",
      },
    });
    // event.api.addPanel({
    //   id: "terminal",
    //   component: "preview",
    //   minimumHeight: 100,
    //   size: 150,
    //   position: {
    //     direction: "below",
    //     referencePanel: "dock",
    //   },
    //   params: { fileSystemTree },
    // });
  };

  return (
    <GridviewReact
      onReady={onReady}
      components={gridComponents}
      className="dockview-theme-abyss"
    />
  );
};

const dockComponents: PanelCollection<IDockviewPanelProps> = {
  editor: (props: IDockviewPanelProps) => (
    <CodeEditorWithSave
      id={props.params.id}
      value={props.params.value}
      directory={props.params.directory}
    />
  ),
};

const gridComponents: PanelCollection<IGridviewPanelProps> = {
  dock: (props: IGridviewPanelProps) => {
    const dispatch = useAppDispatch();
    return (
      <DockviewReact
        watermarkComponent={() => null}
        components={dockComponents}
        onReady={(event) => {
          dispatch(setDockApi(event.api));
        }}
      />
    );
  },
  panes: (props: IGridviewPanelProps<{ id: string }>) => (
    <PaneviewReact
      components={paneComponents}
      onReady={(event) => {
        const filetree = event.api.addPanel({
          id: "filetree",
          title: "Explorer",
          component: "filetree",
          isExpanded: true,
          params: {
            id: props.params.id,
          },
        });
        filetree.headerVisible = false;
      }}
    />
  ),
  terminal: () => <ProjectTerminal />,
  // preview: (props: IGridviewPanelProps<{ fileSystemTree: FileSystemTree }>) => (
  //   <Iframe />
  // ),
};

const paneComponents: PanelCollection<IPaneviewPanelProps<{ id: string }>> = {
  filetree: (props: IPaneviewPanelProps) => (
    <ProjectFileExplorer id={props.params.id} />
  ),
};

export default DockView;
