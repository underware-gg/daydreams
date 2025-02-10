import {
  InferMemoryFromHandler,
  LogLevel,
} from "@daydreamsai/core/src/core/v1/types";
import { createDreams } from "@daydreamsai/core/src/core/v1/dreams";
import {
  createContextHandler,
  createMemoryStore,
  defaultContext,
  defaultContextRender,
  // getContextMemoryHandler,
} from "@daydreamsai/core/src/core/v1/memory";
import { createGroq } from "@ai-sdk/groq";
import { action, input, output } from "@daydreamsai/core/src/core/v1/utils";
import { z } from "zod";
import { Research, researchSchema, startDeepResearch } from "./research";
import * as readline from "readline/promises";
import { tavily } from "@tavily/core";
import { formatXml } from "@daydreamsai/core/src/core/v1/xml";

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY!,
});

const tavilyClient = tavily({
  apiKey: process.env.TAVILY_API_KEY!,
});

const memory = createMemoryStore();

const model = groq("deepseek-r1-distill-llama-70b");

const contextHandler = createContextHandler(
  () => ({
    ...defaultContext(),
    researches: [] as Research[],
  }),
  (memory) => {
    return [
      ...defaultContextRender(memory),
      ...memory.researches.map((r) =>
        formatXml({
          tag: "research",
          params: { id: r.id },
          content: JSON.stringify(r),
        })
      ),
    ];
  }
);

type Handler = typeof contextHandler;
type Memory = InferMemoryFromHandler<Handler>;

const agent = createDreams<Memory, Handler>({
  logger: LogLevel.DEBUG,
  memory,
  context: contextHandler,
  model,
  inputs: {
    message: input({
      schema: z.object({
        user: z.string(),
        text: z.string(),
      }),
      handler(params, ctx) {
        console.log("User:" + params.text);
        ctx.memory.inputs.push({
          ref: "input",
          type: "message",
          params: { user: params.user },
          data: params.text,
          timestamp: Date.now(),
          processed: false,
        });
        return true;
      },
    }),
  },
  outputs: {
    message: output({
      description: "",
      schema: z.string(),
      handler(params, ctx) {
        console.log("Agent:" + params);
        return true;
      },
    }),
  },
  events: {},
  experts: {},
  actions: [
    action({
      name: "start-deep-research",
      schema: researchSchema,
      async handler(call, ctx) {
        const research: Research = {
          ...call.data,
          learnings: [],
          status: "in_progress",
        };

        console.log({ research });

        ctx.memory.researches.push(research);

        startDeepResearch({
          model,
          research,
          tavilyClient,
          maxDepth: 2,
        })
          .then((res) => {
            ctx.memory.results.push({
              ref: "action_result",
              callId: call.id,
              data: res,
              name: call.name,
              timestamp: Date.now(),
              processed: false,
            });

            return agent.run(ctx.id);
          })
          .catch((err) => console.error(err));

        return "Research created!";
      },
    }),
    action({
      name: "cancel-deep-research",
      schema: researchSchema,
      enabled: (ctx) => ctx.memory.researches.length > 0,
      async handler(params, ctx) {
        return "Research canceled!";
      },
    }),
  ],
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

while (true) {
  const input = await rl.question(">");

  const contextId = "my-research";

  await agent.send(contextId, {
    type: "message",
    data: {
      user: "Galego",
      text: input,
    },
  });
}
