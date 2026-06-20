import { tool } from "langchain";
import { z } from "zod";

const weatherByCity: Record<string, string> = {
  "San Francisco": "旧金山今天气候温和，有微风。",
  Shanghai: "上海今天温暖潮湿。",
  Beijing: "北京今天干燥，天空晴朗。",
  Shenzhen: "深圳今天温暖，有零散云层。",
};

/**
 * 天气查询工具。
 *
 * `tool` 会把普通 TypeScript 函数包装成 LangChain Agent 可调用的工具。
 * 模型会根据工具名称、工具描述和参数 schema 决定什么时候调用它。
 */
export const getWeather = tool(
  ({ city }: { city: string }) => {
    return weatherByCity[city] ?? `这个演示中没有 ${city} 的本地天气数据。`;
  },
  {
    name: "get_weather",
    description: "查询某个城市的演示天气报告。",
    schema: z.object({
      city: z.string().describe("需要查询天气的城市"),
    }),
  }
);

/**
 * 城市时区查询工具。
 *
 * 这个工具用于第 02 课，帮助你观察一个 Agent 同时拥有多个工具时，
 * 模型如何根据用户问题选择合适的工具。
 */
export const getCityTimezone = tool(
  ({ city }: { city: string }) => {
    const timezones: Record<string, string> = {
      "San Francisco": "America/Los_Angeles",
      Shanghai: "Asia/Shanghai",
      Beijing: "Asia/Shanghai",
      Shenzhen: "Asia/Shanghai",
    };

    return timezones[city] ?? `没有保存 ${city} 的时区数据。`;
  },
  {
    name: "get_city_timezone",
    description: "查询某个城市的 IANA 时区名称。",
    schema: z.object({
      city: z.string().describe("需要查询时区的城市"),
    }),
  }
);
