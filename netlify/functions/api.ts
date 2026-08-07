import serverless from "serverless-http";

process.env.NETLIFY_SERVERLESS = "true";

let cachedHandler: Promise<any> | null = null;

export const handler = async (event: any, context: any) => {
  if (!cachedHandler) {
    cachedHandler = import("../../server").then(({ app }) => serverless(app));
  }

  const handlerFn = await cachedHandler;
  return handlerFn(event, context);
};
