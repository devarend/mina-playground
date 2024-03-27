import { configureStore } from "@reduxjs/toolkit";
import { fileTreeApi } from "@/services/fileTree";
import { projectApi } from "@/services/project";
import { setupListeners } from "@reduxjs/toolkit/query";
import webcontainerReducer from "@/features/webcontainer/webcontainerSlice";
import fileTreeReducer from "@/features/fileTree/fileTreeSlice";
import dockViewReducer from "@/features/dockView/dockViewSlice";
import { versionControlApi } from "@/services/versionControl";
import { snippetApi } from "@/services/snippet";
import { minaPlaygroundApi } from "@/services/minaPlayground";

export const store = configureStore({
  reducer: {
    fileTree: fileTreeReducer,
    webcontainer: webcontainerReducer,
    dockView: dockViewReducer,
    [fileTreeApi.reducerPath]: fileTreeApi.reducer,
    [projectApi.reducerPath]: projectApi.reducer,
    [versionControlApi.reducerPath]: versionControlApi.reducer,
    [snippetApi.reducerPath]: snippetApi.reducer,
    [minaPlaygroundApi.reducerPath]: minaPlaygroundApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }).concat(
      fileTreeApi.middleware,
      projectApi.middleware,
      versionControlApi.middleware,
      snippetApi.middleware,
      minaPlaygroundApi.middleware
    ),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
