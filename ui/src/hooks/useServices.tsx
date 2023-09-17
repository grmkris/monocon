import { z } from "zod";
import { useQuery } from "@tanstack/react-query";

export const Service = z.object({
  name: z.string(),
  url: z.string(),
  stream: z.string(),
  streamFromStart: z.string(),
});

export const Services = z.array(Service);
export type Services = z.infer<typeof Services>;
export type Service = z.infer<typeof Service>;

export const useServices = () => {
  return useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const response = await fetch("http://localhost:42069/services");
      const data = await response.json();
      return Services.parse(data);
    },
  });
};
