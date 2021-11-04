import { NextApiRequest, NextApiResponse } from 'next';

export default async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  res.clearPreviewData();
  const redirectedTemporarily = 307;
  res.writeHead(redirectedTemporarily, { location: '/' });
  res.end();
};
