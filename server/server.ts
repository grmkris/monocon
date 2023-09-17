import minimist from "minimist";
const logRowsForServices: string[][] = [];

const example_services = [
  ["bun", "run", "dev:backend-hono"],
  ["bun", "run", "dev:backend-elysia"],
  ["bun", "run", "dev:frontend"],
];

// Parse the command-line arguments using minimist
const argv = minimist(Bun.argv.slice(2));

// Extracting service commands based on the command-line arguments
const services: string[][] = [];
for (const key of Object.keys(argv)) {
  if (key !== "_" && typeof argv[key] === "string") {
    services.push(["bun", "run", argv[key]]);
  }
}

// Start all services
console.log("starting services", services);
services.forEach(startService);
const streamControllers: ReadableStreamDefaultController<string>[] = [];

function startService(serviceCommands: string[], index: number) {
  const proc = Bun.spawn(serviceCommands, {
    cwd: "../../bun-trpc-react",
    stdout: "pipe",
  });

  const reader = proc.stdout.getReader();

  function processResult(result: ReadableStreamDefaultReadResult<Uint8Array>) {
    if (result.done) {
      if (streamControllers[index]) {
        streamControllers[index].close();
      }
      return;
    }
    const line = new TextDecoder().decode(result.value);
    const cleanLine = line.replace(/\n$/, "");

    if (!logRowsForServices[index]) {
      logRowsForServices[index] = [];
    }

    logRowsForServices[index].push(cleanLine);

    if (streamControllers[index]) {
      streamControllers[index].enqueue(line);
    }

    reader.read().then(processResult);
  }

  reader.read().then(processResult);
}

const server = Bun.serve({
  port: 42069,
  async fetch(request) {
    console.log(request.url);
    const responseInit: ResponseInit = {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET",
        "Content-Type": "application/json",
      },
    };
    // endpoint to serve the static frontend
    if (request.url === "http://localhost:42069/") {
      return new Response(Bun.file("./index.html"), {
        headers: {
          "Content-Type": "text/html",
        },
      });
    }

    if (request.url.startsWith("http://localhost:42069/assets")) {
      const path = new URL(request.url).pathname;
      console.log(path);
      const file = Bun.file("." + path);
      return new Response(file);
    }

    // Endpoint to show all running services
    if (request.url === "http://localhost:42069/services") {
      return new Response(
        JSON.stringify(
          services.map((service, index) => {
            return {
              name: service[2],
              url: `http://localhost:42069/services/${index}`,
              stream: `http://localhost:42069/services/${index}/stream`,
              streamFromStart: `http://localhost:42069/services/${index}/stream?fromStart=true`,
            };
          }),
        ),
        { headers: responseInit.headers },
      );
    }

    const serviceMatch = request.url.match(/\/services\/(\d+)/);
    if (!serviceMatch) {
      return new Response("Not found", {
        status: 404,
        headers: responseInit.headers,
      });
    }

    const serviceIndex = Number(serviceMatch[1]);
    if (!logRowsForServices[serviceIndex]) {
      return new Response("Not found", {
        status: 404,
        headers: responseInit.headers,
      });
    }

    if (request.url.includes("/stream")) {
      const urlParams = new URL(request.url).searchParams;
      const fromStart = urlParams.get("fromStart") === "true";

      const stream = new ReadableStream<string>({
        start(controller) {
          if (fromStart) {
            logRowsForServices[serviceIndex].forEach((line) => {
              controller.enqueue(line);
              controller.enqueue("\n");
            });
          }
          streamControllers[serviceIndex] = controller;
        },
      });
      return new Response(stream, {
        status: 200,
        headers: responseInit.headers,
      });
    }

    return new Response(JSON.stringify(logRowsForServices[serviceIndex]), {
      status: 200,
      headers: responseInit.headers,
    });
  },
});

console.log("🕷️ Monocon is running at http://localhost:42069");
