import { OpenAIStream } from "@/utils/answer";
import { DEMO_STOP_MESSAGE, isDemoMode } from "@/utils/demo";

export const config = {
  runtime: "edge"
};

const handler = async (req: Request): Promise<Response> => {
  // 演示模式下绝不调用 OpenAI
  if (isDemoMode()) {
    return new Response(DEMO_STOP_MESSAGE, { status: 403 });
  }

  try {
    const { prompt } = (await req.json()) as {
      prompt: string;
    };

    // 直接从环境变量获取 API 密钥，而不是从请求体
    const apiKey = process.env.OPENAI_API_KEY;

    // 确保已正确配置 API 密钥
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY is not configured.");
    }

    const stream = await OpenAIStream(prompt, apiKey);

    return new Response(stream);
  } catch (error) {
    console.error(error);
    return new Response("Error", { status: 500 });
  }
};

export default handler;
