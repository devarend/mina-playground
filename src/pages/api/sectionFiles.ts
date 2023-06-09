import type { NextApiRequest, NextApiResponse } from "next";
import { getTutorialByChapterAndSection } from "@/utils/tutorial";
import { isValidChapterAndSection } from "@/utils/validation";

type Error = {
  message: string;
};

type Data = {
  files: Record<string, any>;
};

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<Error | Data>
) => {
  if (req.method !== "POST") {
    res.status(405).send({ message: "Only POST requests allowed" });
    return;
  }
  const isValid = isValidChapterAndSection(req.body.chapter, req.body.section);
  if (!isValid) {
    res.status(422).json({ message: "Chapter and/or section is not correct" });
    return;
  }
  const response = await getTutorialByChapterAndSection(
    req.body.chapter,
    req.body.section
  );
  res.setHeader("Cache-Control", "s-maxage=2678400");
  res.status(200).json({ ...response });
};

export default handler;
