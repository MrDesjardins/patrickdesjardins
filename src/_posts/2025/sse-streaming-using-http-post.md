---
title: "SSE Streaming using HTTP Post?"
date: "2025-10-013"
categories:
 - "react"
 - "http"
 - "sse"
---

[Server-Side Event](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events) known as SSE uses by default HTTP GET with the `EventSource` JavaScript object. However, when handling a large volume of data, HTTP GET using a query string falls short. Relying on HTTP Post and a large body is better. In this article, I'll show how to use SSE with HTTP POST when connecting to an API that streams data from the server to the client.

# Server

We can build a small API that connects to OpenAI:

```typescript

export async function POST(request: NextRequest) {
  const jsonPayload = await request.json();
  const messages: Message[] = jsonPayload.messages;
  if (messages == null) {
    return new NextResponse("Error", {
      status: 403,
      statusText: "invalid message",
    });
  }
  try {
    const client = new OpenAI();

    const response = await client.responses.create({
      model: "gpt-5-mini",
      input: messages.map((d) => d.author.name + " said: " + d.text).join("\n"),
      stream: true,
    });

    const encoder = new TextEncoder();

    const readableStream = new ReadableStream({
      async start(controller) {
        // Handle client abort (user cancels request)
        request.signal.addEventListener("abort", () => {
          controller.close();
        });

        try {
          for await (const event of response) {
            console.log("LLM Event:", event);

            if (event.type === "response.output_text.delta") {
              const data = event.delta;
              controller.enqueue(encoder.encode(data));
            } else if (event.type === "response.created") {
              const data = APILLM_CREATED_TOKEN;
              controller.enqueue(encoder.encode(data));
            } else if (event.type === "response.in_progress") {
              const data = APILLM_THINKING_TOKEN;
              controller.enqueue(encoder.encode(data));
            } else if (
              event.type === "response.content_part.added" &&
              event.part.type === "output_text"
            ) {
              const data = APILLM_CLEAR_TOKEN;
              controller.enqueue(encoder.encode(data));
            } else if (
              event.type === "response.completed" ||
              event.type === "response.output_text.done"
            ) {
              const data = APILLM_END_TOKEN;
              controller.enqueue(encoder.encode(data));
            }
          }
        } catch (err) {
          console.error("Stream error:", err);
          controller.error(err);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no", // disables buffering on some reverse proxies
      },
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({
      type: "error",
      error: "Failed to generate response",
    });
  }
}

```

The code contains a few parts. The first one is getting the HTTP body to get the list of previous messages. A minimum of one exists, which is the initial question. Then, previous responses and user messages will be there to build the context. The second portion connects to the OpenAI client and creates a `ReadableStream` object. This is the object in the third part that will respond to the browser. The `ReadableStream` object iterates through the OpenAI stream, checking for a specific JSON part to return a simplified version for our API. In that part, we encode some string to indicate to the UI a "state" instead of the response. The new response from OpenAI comes from the different chunk (delta) that we stream to the browser.

The streaming works using headers. We keep the connection alive and mark the response with `text/event-stream`.

# Client

The client needs to do an HTTP request and keep listening until the connection is closed by the server.

```typescript
async function streamMessages(
 messages: Message[],
  create: (msg: Message) => void,
  edit: (id: string, msg: string) => void,
  completeSignal: () => void
) {
  // Response message
  const msgStream: Message = {
    timestampMs: Date.now(),
    text:"  ",
    id: uuidv7(),
    author: ChatGPTAuthor,
    isSuccess: true,
 };
  const response = await fetch("/api/llmstream", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ messages }),
 });
  create(msgStream); // Add the new message to the list

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  while (reader !== undefined) {
    const { done, value } = await reader.read();
    if (done) {
      break;
 }

    const chunk = decoder.decode(value, { stream: true });
    if (chunk.indexOf(APILLM_END_TOKEN) >= 0) {
      completeSignal();
 } else {
      edit(msgStream.id, chunk);
 }
 }
}
```
The function creates a `Message` that the React component can use. The `edit` parameter is a callback that allows the chat window to update adn the `completeSignal` allows the React inputs to be enabled again. The main part of the code is to use the response body `getReader` which will contain data that we read and decode. When the server sends the completion signal, the `done` property is sent, and we can stop listening to the reader.

# Conclusion

Using HTTP Post allows sending a large amount of text in the body and also enables adding attachments. `EventSource` remains a clean solution, but does not allow modifying the HTTP method, and thus the proposed solution of manually using a `Reader'and `TextDecoder` is more verbose but flexible.