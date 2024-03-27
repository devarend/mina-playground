import type { NextApiRequest, NextApiResponse } from "next";

const faucetRequest = async (address: string) => {
  const response = await fetch(
    "https://faucet.minaprotocol.com/api/v1/faucet",
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        network: "berkeley-qanet",
        address: address,
      }),
    }
  );
  if (!response.ok) {
    console.log(response);
    const message = `An error has occured: ${response.status}`;
    throw new Error(message);
  }
  return await response.json();
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    return res.status(500).json({ message: "Method not allowed" });
  }

  try {
    const response = await faucetRequest(req.body.address);
    res.status(200).json(response);
  } catch (e) {
    res.status(500).json({ message: "Failed faucet request" });
  }
};

export default handler;
