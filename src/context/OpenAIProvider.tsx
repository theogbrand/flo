import {
  clearHistory,
  Conversation,
  getHistory,
  storeConversation,
  History,
  deleteConversationFromHistory,
  updateConversation,
} from "@/utils/History";
import {
  defaultConfig,
  OpenAIChatMessage,
  OpenAIConfig,
  OpenAISystemMessage,
  OpenAIChatModels,
} from "@/utils/OpenAI";
import React, { PropsWithChildren, useCallback, useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthProvider";

const CHAT_ROUTE = "/";

const defaultContext = {
  systemMessage: {
    role: "system",
    content: "You are a helpful AI chatbot.",
  } as OpenAISystemMessage,
  // preMessage:
  //   `Background text: "<INSERT YOUR BACKGROUND CONTEXT HERE>"\n\nAnswer the following question about the background text above only. If you do not know the answer, truthfully answer "I do not know the answer to that". Do not make up an answer.\n\nQuestion: ` as string,
  preMessage: `` as string,
  messages: [] as OpenAIChatMessage[],
  config: defaultConfig as OpenAIConfig,
  updateSystemMessage: (content: string) => {},
  updatePreMessage: (content: string) => {},
  addMessage: () => {},
  removeMessage: (id: number) => {},
  conversationName: "",
  conversationId: "",
  deleteConversation: () => {},
  updateConversationName: () => {},
  conversations: {} as History,
  clearConversations: () => {},
  clearConversation: () => {},
  loadConversation: (id: string, conversation: Conversation) => {},
  toggleMessageRole: (id: number) => {},
  updateMessageContent: (id: number, content: string) => {},
  updateConfig: (newConfig: Partial<OpenAIConfig>) => {},
  submit: () => {},
  submitAll: () => {},
  loading: true,
  error: "",
};

const OpenAIContext = React.createContext<{
  systemMessage: OpenAISystemMessage;
  preMessage: string;
  messages: OpenAIChatMessage[];
  config: OpenAIConfig;
  updateSystemMessage: (content: string) => void;
  updatePreMessage: (content: string) => void;
  addMessage: (
    content?: string,
    submit?: boolean,
    role?: "user" | "assistant"
  ) => void;
  removeMessage: (id: number) => void;
  conversationName: string;
  conversationId: string;
  deleteConversation: (id: string) => void;
  updateConversationName: (id: string, name: string) => void;
  conversations: History;
  clearConversation: () => void;
  clearConversations: () => void;
  loadConversation: (id: string, conversation: Conversation) => void;
  toggleMessageRole: (id: number) => void;
  updateMessageContent: (id: number, content: string) => void;
  updateConfig: (newConfig: Partial<OpenAIConfig>) => void;
  submit: () => void;
  loading: boolean;
  error: string;
}>(defaultContext);

export default function OpenAIProvider({ children }: PropsWithChildren) {
  const { token } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  // Conversation state
  const [conversations, setConversations] = React.useState<History>(
    {} as History
  );
  const [conversationId, setConversationId] = React.useState<string>("");
  const [conversationName, setConversationName] = React.useState("");
  const [systemMessage, setSystemMessage] = React.useState<OpenAISystemMessage>(
    defaultContext.systemMessage
  );
  const [preMessage, setPreMessage] = React.useState<string>(
    defaultContext.preMessage
  );
  const [config, setConfig] = React.useState<OpenAIConfig>(defaultConfig);
  const [messages, setMessages] = React.useState<OpenAIChatMessage[]>([]);

  // Load conversation from local storage
  useEffect(() => {
    setConversations(getHistory());
  }, []);

  const updateSystemMessage = (content: string) => {
    setSystemMessage({
      role: "system",
      content,
    });
  };

  const updatePreMessage = (content: string) => {
    setPreMessage(content);
  };

  const removeMessage = (id: number) => {
    setMessages((prev) => {
      return [...prev.filter((message) => message.id !== id)];
    });
  };

  const toggleMessageRole = (id: number) => {
    setMessages((prev) => {
      const index = prev.findIndex((message) => message.id === id);
      if (index === -1) return prev;
      const message = prev[index];
      return [
        ...prev.slice(0, index),
        {
          ...message,
          role: message.role === "user" ? "assistant" : "user",
        },
        ...prev.slice(index + 1),
      ];
    });
  };

  const updateConfig = (newConfig: Partial<OpenAIConfig>) => {
    setConfig((prev) => {
      // If model changes set max tokens to half of the model's max tokens
      if (newConfig.model && newConfig.model !== prev.model) {
        newConfig.max_tokens = Math.floor(
          OpenAIChatModels[newConfig.model].maxLimit / 2
        );
      }

      return {
        ...prev,
        ...newConfig,
      };
    });
  };

  const updateMessageContent = (id: number, content: string) => {
    setMessages((prev) => {
      const index = prev.findIndex((message) => message.id === id);
      if (index === -1) return prev;
      const message = prev[index];
      return [
        ...prev.slice(0, index),
        {
          ...message,
          content,
        },
        ...prev.slice(index + 1),
      ];
    });
  };

  const handleStoreConversation = useCallback(() => {
    if (messages.length === 0) return;

    const conversation = {
      name: conversationName,
      systemMessage,
      messages,
      config,
      lastMessage: Date.now(),
    } as Conversation;

    let id = storeConversation(conversationId, conversation);
    setConversationId(id);
    setConversations((prev) => ({ ...prev, [id]: conversation }));

    if (router.pathname === CHAT_ROUTE) router.push(`/chat/${id}`);
  }, [conversationId, messages]);

  useEffect(() => {
    handleStoreConversation();
  }, [messages, systemMessage, config]);

  const loadConversation = (id: string, conversation: Conversation) => {
    setConversationId(id);

    const { systemMessage, messages, config, name } = conversation;

    setSystemMessage(systemMessage);
    setMessages(messages);
    updateConfig(config);
    setConversationName(name);
  };

  const clearConversations = useCallback(() => {
    clearHistory();

    setMessages([]);
    setConversationId("");
    setConversations({});

    router.push("/");
  }, []);

  const clearConversation = () => {
    setMessages([]);
    setSystemMessage(defaultContext.systemMessage);
    setConversationId("");
  };

  const deleteConversation = (id: string) => {
    deleteConversationFromHistory(id);
    setConversations((prev) => {
      const { [id]: _, ...rest } = prev;
      return rest;
    });

    if (id === conversationId) clearConversation();
  };

  const updateConversationName = (id: string, name: string) => {
    setConversations((prev) => {
      const conversation = prev[id];
      if (!conversation) return prev;
      return {
        ...prev,
        [id]: {
          ...conversation,
          name,
        },
      };
    });

    if (id === conversationId) setConversationName(name);

    updateConversation(id, { name });
  };

  const CompleteOne = useCallback(
    async (messages_: OpenAIChatMessage[] = [], insertIndex: number) => {
      if (loading) return;
      setLoading(true);

      messages_ = messages_.length ? messages_ : messages;
      messages_.pop();

      try {
        console.log(
          "calling API with:",
          [systemMessage, ...messages_].map(({ role, content }) => ({
            role,
            content,
          }))
        );
        // console.log("config: ", config);
        const decoder = new TextDecoder();
        const { body, ok } = await fetch("/api/completion", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...config,
            messages: [systemMessage, ...messages_].map(
              ({ role, content }) => ({
                role,
                content,
              })
            ),
          }),
        });

        if (!body) return;
        const reader = body.getReader();

        if (!ok) {
          // Get the error message from the response body
          const { value } = await reader.read();
          const chunkValue = decoder.decode(value);
          const { error } = JSON.parse(chunkValue);

          throw new Error(
            error?.message ||
              "Failed to fetch response, check your API key and try again."
          );
        }

        let done = false;

        const message = {
          id: messages_.length,
          role: "assistant",
          content: "",
        } as OpenAIChatMessage;

        // Create a new message object to avoid modifying the original object
        const newMessage = { ...message, id: insertIndex };
        // console.log("new message:", newMessage, "insert index:", newMessage.id);

        setMessages((prev) => {
          // Clone the original array
          const newList = [...prev];
          // Insert the newMessage at the specified index
          newList.splice(insertIndex + 1, 0, newMessage);
          newList.splice(insertIndex, 1);
          // console.log("new list: ", newList);
          return newList;
          // message.id = prev.length;
          // return [...prev, message];
        });

        while (!done) {
          const { value, done: doneReading } = await reader.read();
          done = doneReading;
          const chunkValue = decoder.decode(value);
          message.content += chunkValue;

          updateMessageContent(newMessage.id as number, message.content);
        }
        return { id: newMessage.id, content: message.content };
      } catch (error: any) {
        setMessages((prev) => {
          return [
            ...prev,
            {
              id: prev.length,
              role: "assistant",
              content: error.message,
            },
          ];
        });
        return error.message;
      }

      // setLoading(false);
    },
    [config, messages, systemMessage, loading, token]
  );

  const submit = useCallback(
    async (messages_: OpenAIChatMessage[] = []) => {
      messages_ = messages_.length ? messages_ : messages;

      for (let i = 0; i < messages_.length; i++) {
        // if (messages_[i].role === "user") {
        //   let message = `${preMessage} "${messages[i].content.trim()}"`;
        //   messages[i].content = message;
        // }
        if (messages_[i].role === "assistant") {
          // console.log("index:", i);
          // console.log("message content:", messages_[i].content);
          await CompleteOne(messages_.slice(0, i + 1), i).then((prms) => {
            // console.log("promise returned:", prms);
            // console.log("most updated state of messages: ", messages);
            messages.forEach((msg) => {
              if (msg.id === prms?.id) msg.content = prms?.content;
            });
          });
        }
      }
      setLoading(false);
    },
    [config, messages, systemMessage, loading, token]
  );

  const addMessage = useCallback(
    (
      content: string = "",
      submit_: boolean = false,
      role: "user" | "assistant" = "user"
    ) => {
      setMessages((prev) => {
        const messages = [
          ...prev,
          {
            id: prev.length,
            role,
            content: content || "",
          } as OpenAIChatMessage,
        ];
        submit_ && submit(messages);
        return messages;
      });
    },
    [submit]
  );

  const value = React.useMemo(
    () => ({
      systemMessage,
      preMessage,
      messages,
      config,
      loading,
      updateSystemMessage,
      updatePreMessage,
      addMessage,
      removeMessage,
      conversationId,
      conversationName,
      updateConversationName,
      deleteConversation,
      loadConversation,
      clearConversation,
      conversations,
      clearConversations,
      toggleMessageRole,
      updateMessageContent,
      updateConfig,
      submit,
      error,
    }),
    [
      systemMessage,
      preMessage,
      messages,
      config,
      loading,
      addMessage,
      submit,
      conversationId,
      conversations,
      clearConversations,
      error,
    ]
  );

  return (
    <OpenAIContext.Provider value={value}>{children}</OpenAIContext.Provider>
  );
}

export const useOpenAI = () => React.useContext(OpenAIContext);
