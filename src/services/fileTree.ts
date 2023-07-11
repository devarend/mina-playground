import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { setChangedFieldStatus } from "@/features/fileTree/fileTreeSlice";

export const fileTreeApi = createApi({
  reducerPath: "fileTreeApi",
  baseQuery: fetchBaseQuery({ baseUrl: `${process.env.NEXT_PUBLIC_API_URL}/` }),
  endpoints: (builder) => ({
    getPokemonByName: builder.query({
      query: (name) => `project/64a1f352851a7f64391ab7cc`,
    }),
    updateFileTree: builder.mutation({
      query(data) {
        const { id, body } = data;
        return {
          url: `fileTree/${id}`,
          method: "PATCH",
          body,
        };
      },
      async onQueryStarted(data, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          const { body } = data;
          const { location } = body;
          dispatch(setChangedFieldStatus({ location, saved: true }));
        } catch {}
      },
    }),
    deleteFileTreeItem: builder.mutation({
      query(data) {
        const { id, body } = data;
        return {
          url: `fileTree/${id}`,
          method: "DELETE",
          body,
        };
      },
    }),
  }),
});

export const { useUpdateFileTreeMutation, useDeleteFileTreeItemMutation } =
  fileTreeApi;
