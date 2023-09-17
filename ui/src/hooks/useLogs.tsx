import { useEffect, useState } from "react";

export const useLogs = (props: { url: string }) => {
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    let reader: ReadableStreamDefaultReader | null = null;
    const streamLogs = async () => {
      const response = await fetch(props.url);
      if (!response.body) {
        console.warn("response.body is null");
        return;
      }

      reader = response.body.getReader();

      // Read the stream and update state
      const streamData = async () => {
        if (!reader) {
          console.warn("reader is null");
          return;
        }
        const { done, value } = await reader.read();
        if (done) return;

        const text = new TextDecoder().decode(value);
        setLogs((prevLogs) => [...prevLogs, text]);

        // Continue reading the stream
        streamData();
      };

      streamData();
    };

    streamLogs();

    // Cleanup function to close the stream if the component is unmounted
    return () => {
      reader && reader.releaseLock();
    };
  }, []);

  return logs;
};
