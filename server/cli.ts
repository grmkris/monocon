import minimist from "minimist";

const logRowsForServices: string[][] = [];

// Parse the command-line arguments using minimist
const argv = minimist(Bun.argv.slice(2));

// Extracting service commands based on the command-line arguments
const services: string[][] = [];
for (const key of Object.keys(argv)) {
  if (key !== "_" && typeof argv[key] === "string") {
    services.push(["bun", "run", argv[key]]);
  }
}

const streamControllers: ReadableStreamDefaultController<string>[] = [];

function startService(serviceCommands: string[], index: number) {
  // ... rest of the function remains unchanged ...
}

// Start all services
services.forEach(startService);

// ... rest of the code remains unchanged ...
