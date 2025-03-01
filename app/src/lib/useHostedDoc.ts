import { useEffect, useRef, useState } from "react";
import { useMutation } from "react-query";
import { useDebouncedCallback } from "use-debounce";

import { updateChartText } from "./queries";
import { useParseDoc } from "./useParseDoc";

export function useHostedDoc(id: string, initialFullText: string) {
  const [fullText, setFullText] = useState(initialFullText);

  const lastFullText = useRef(fullText);
  const parsedDoc = useParseDoc(fullText, setFullText, true);

  // get mutate and loading state
  const { mutate, isLoading } = useMutation((text: string) =>
    updateChartText(text, id)
  );
  // get debounced mutate
  const {
    callback: debounceMutate,
    flush,
    pending,
  } = useDebouncedCallback((currentText: string) => {
    mutate(currentText);
  }, 1000);

  useEffect(() => {
    if (lastFullText.current !== fullText) {
      debounceMutate(fullText);
      lastFullText.current = fullText;
    }
  }, [debounceMutate, fullText]);

  return {
    fullText,
    ...parsedDoc,
    flush,
    pending,
    isLoading,
  };
}
