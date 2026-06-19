# Exercises

Use these exercises after each lesson script.

## Lesson 01

- Change the city in `src/lessons/01-basic-agent.ts`.
- Add a new city to `src/tools/weather.ts`.
- Ask a question that does not require the weather tool and observe the result.

## Lesson 02

- Add a third tool named `get_city_language`.
- Make the user ask about two cities in one message.
- Compare whether the model calls one tool or multiple tools.

## Lesson 03

- Change the system prompt from bilingual assistant to contract-review assistant.
- Force the output to include `answer`, `evidence`, and `limitations`.
- Test whether the model follows the output shape.

## Lesson 04

- Change the `thread_id` and observe whether the agent still remembers the favorite city.
- Add a second preference in the first message.
- Ask about both preferences in the second message.

## Lesson 05

- Replace the Gutenberg URL with another public text page.
- Ask for a summary, then ask for evidence from the fetched text.
- Reduce `maxTokens` and observe whether the answer changes.

## Lesson 06

- Compare the output of `lesson:05` and `lesson:06` for the same question.
- Ask a counting question and check whether Deep Agent uses stronger built-in tools.
- Enable LangSmith tracing and inspect the model/tool call sequence.
