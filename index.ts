const logRows: string[] = [];

const proc = Bun.spawn(["bun", "run", "dev:backend-hono"], {
  cwd: "../bun-trpc-react",
  stdout: "pipe",
});

const reader = proc.stdout.getReader();
let streamController: ReadableStreamDefaultController<string>;

// This function processes the output of the spawned process.
function processResult(result: ReadableStreamDefaultReadResult<Uint8Array>) {
  if (result.done) {
    if (streamController) {
      streamController.close();
    }
    return;
  }
  const line = new TextDecoder().decode(result.value);
  // remove newline at the end of the message
  const cleanLine = line.replace(/\n$/, "");
  logRows.push(cleanLine);
  if (streamController) {
    streamController.enqueue(line);
  }

  reader.read().then(processResult);
}

reader.read().then(processResult);

const server = Bun.serve({
  port: 42069,
  async fetch(request) {
    console.log(request.url);
    if (request.url === "http://localhost:42069/") {
      return new Response(JSON.stringify(logRows), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      });
    } else if (request.url === "http://localhost:42069/stream") {
      console.log("streaming");
      const urlParams = new URL(request.url).searchParams;
      const fromStart = urlParams.get("fromStart") === "true";

      const stream = new ReadableStream<string>({
        start(controller) {
          if (fromStart) {
            logRows.forEach((line) => {
              controller.enqueue(line);
            });
          }
          streamController = controller;
        },
      });
      return new Response(stream, {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      });
    } else {
      return new Response("Not found", {
        status: 404,
      });
    }
  },
});

console.log("🕷️ Monocon is running at http://localhost:42069");
