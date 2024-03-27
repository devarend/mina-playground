import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const minaPlaygroundApi = createApi({
  reducerPath: "minaPlaygroundApi",
  baseQuery: fetchBaseQuery({ baseUrl: `/` }),
  endpoints: (builder) => ({
    faucetRequest: builder.mutation({
      query(data) {
        const { body } = data;
        return {
          url: `api/faucet`,
          method: "POST",
          body,
        };
      },
    }),
    checkTransaction: builder.query<any, any>({
      query: (transactionId) => ({
        url: `api/check-transaction/${transactionId}`,
      }),
    }),
  }),
});

export const { useFaucetRequestMutation, useCheckTransactionQuery } =
  minaPlaygroundApi;
