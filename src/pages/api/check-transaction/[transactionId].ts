import type { NextApiRequest, NextApiResponse } from "next";

const checkTransactionRequest = async (transactionId: string) => {
  const response = await fetch(
    `https://minascan.io/qanet/api//api/core/transactions/block-confirmation/${transactionId}`
  );
  if (!response.ok) {
    const message = `An error has occured: ${response.status}`;
    throw new Error(message);
  }
  return await response.json();
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "GET") {
    return res.status(500).json({ message: "Method not allowed" });
  }
  const { transactionId } = req.query;
  try {
    const response = await checkTransactionRequest(transactionId as string);
    res.status(200).json(response);
  } catch (e) {
    res.status(500).json({ message: "Failed check transaction request" });
  }
};

export default handler;
