import { useQuery } from "@tanstack/react-query";

export function useCMSContent(pageId: string): Record<string, string> {
  const { data = {} } = useQuery<Record<string, string>>({
    queryKey: [`/api/cms/content/${pageId}`],
    staleTime: 1000 * 60 * 5,
  });
  return data;
}
