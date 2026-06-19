import { tool } from "langchain";
import { z } from "zod";

const weatherByCity: Record<string, string> = {
  "San Francisco": "San Francisco is mild and breezy today.",
  Shanghai: "Shanghai is warm and humid today.",
  Beijing: "Beijing is dry with clear skies today.",
  Shenzhen: "Shenzhen is warm with scattered clouds today.",
};

export const getWeather = tool(
  ({ city }: { city: string }) => {
    return weatherByCity[city] ?? `${city} has no local forecast in this demo.`;
  },
  {
    name: "get_weather",
    description: "Get a small demo weather report for a city.",
    schema: z.object({
      city: z.string().describe("The city to get the weather for"),
    }),
  }
);

export const getCityTimezone = tool(
  ({ city }: { city: string }) => {
    const timezones: Record<string, string> = {
      "San Francisco": "America/Los_Angeles",
      Shanghai: "Asia/Shanghai",
      Beijing: "Asia/Shanghai",
      Shenzhen: "Asia/Shanghai",
    };

    return timezones[city] ?? `No timezone stored for ${city}.`;
  },
  {
    name: "get_city_timezone",
    description: "Get the IANA timezone name for a city.",
    schema: z.object({
      city: z.string().describe("The city to get the timezone for"),
    }),
  }
);
