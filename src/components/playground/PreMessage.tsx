import { useOpenAI } from "@/context/OpenAIProvider";
import React from "react";
import TextArea from "../input/TextArea";

type Props = {};

export default function PreMessage({}: Props) {
  const { updatePreMessage, preMessage } = useOpenAI();

  return (
    <TextArea
      title="PreMessage"
      className="grow"
      placeholder="Add context for RAG, prompt-based guardrails to append before user's message"
      value={preMessage}
      onChange={(e) => updatePreMessage(e.target.value)}
    />
  );
}
