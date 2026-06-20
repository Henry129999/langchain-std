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

## Lesson 07

- Set `LANGSMITH_TRACING=true` and run `npm run lesson:07`.
- Compare the terminal output with the LangSmith trace.
- Check whether the trace shows the weather tool call and its arguments.

## Lesson 08

- Set `COURSE_RESEARCH_URL` to another public text URL.
- Set `COURSE_RESEARCH_QUESTION` to a question that requires evidence.
- Check whether the answer includes `answer`, `evidence`, and `limitations`.

## Lesson 09

- Change the price and discount rate in `src/lessons/09-structured-output.ts`.
- Check whether the final answer remains valid JSON.
- Add another required JSON field in the system prompt and observe compliance.

## Lesson 10

- Ask the Agent to read `README.md` instead of `exercises/README.md`.
- Try a path outside the project directory and confirm the tool refuses it.
- Ask a question that the selected file cannot answer.

## Lesson 11

- Search for `memory`, `research`, and `beginner`.
- Ask for a keyword that does not exist in the catalog.
- Add a new course record in `src/tools/course-catalog.ts` and rerun the lesson.
