import { tool } from "langchain";
import { z } from "zod";

interface CityRecord {
  canonicalName: string;
  weather: string;
  timezone: string;
  country: string;
}

const cityRecords: Record<string, CityRecord> = {
  "san francisco": {
    canonicalName: "San Francisco",
    weather: "旧金山今天气候温和，有微风。",
    timezone: "America/Los_Angeles",
    country: "United States",
  },
  shanghai: {
    canonicalName: "Shanghai",
    weather: "上海今天温暖潮湿。",
    timezone: "Asia/Shanghai",
    country: "China",
  },
  "上海": {
    canonicalName: "Shanghai",
    weather: "上海今天温暖潮湿。",
    timezone: "Asia/Shanghai",
    country: "China",
  },
  beijing: {
    canonicalName: "Beijing",
    weather: "北京今天干燥，天空晴朗。",
    timezone: "Asia/Shanghai",
    country: "China",
  },
  "北京": {
    canonicalName: "Beijing",
    weather: "北京今天干燥，天空晴朗。",
    timezone: "Asia/Shanghai",
    country: "China",
  },
  shenzhen: {
    canonicalName: "Shenzhen",
    weather: "深圳今天温暖，有零散云层。",
    timezone: "Asia/Shanghai",
    country: "China",
  },
  "深圳": {
    canonicalName: "Shenzhen",
    weather: "深圳今天温暖，有零散云层。",
    timezone: "Asia/Shanghai",
    country: "China",
  },
  nanjing: {
    canonicalName: "Nanjing",
    weather: "南京今天多云，适合户外通勤。",
    timezone: "Asia/Shanghai",
    country: "China",
  },
  "南京": {
    canonicalName: "Nanjing",
    weather: "南京今天多云，适合户外通勤。",
    timezone: "Asia/Shanghai",
    country: "China",
  },
};

function findCity(city: string): CityRecord | undefined {
  return cityRecords[city.trim().toLowerCase()] ?? cityRecords[city.trim()];
}

/**
 * 天气查询工具。
 *
 * `tool` 会把普通 TypeScript 函数包装成 LangChain Agent 可调用的工具。
 * 模型会根据工具名称、工具描述和参数 schema 决定什么时候调用它。
 */
export const getWeather = tool(
  ({ city }: { city: string }) => {
    const record = findCity(city);

    if (!record) {
      return `这个演示中没有 ${city} 的本地天气数据。`;
    }

    return record.weather;
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
    const record = findCity(city);

    return record?.timezone ?? `没有保存 ${city} 的时区数据。`;
  },
  {
    name: "get_city_timezone",
    description: "查询某个城市的 IANA 时区名称。",
    schema: z.object({
      city: z.string().describe("需要查询时区的城市"),
    }),
  }
);

/**
 * 城市所属国家查询工具。
 *
 * 第 04 课会用它演示“新增工具时只扩展确定性能力，不改 Agent 主流程”。
 */
export const getCityCountry = tool(
  ({ city }: { city: string }) => {
    const record = findCity(city);

    return record?.country ?? `没有保存 ${city} 的国家信息。`;
  },
  {
    name: "get_city_country",
    description: "查询某个城市所属国家；只回答演示数据中保存的城市。",
    schema: z.object({
      city: z.string().describe("需要查询所属国家的城市"),
    }),
  }
);
