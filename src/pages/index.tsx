import ChatMessages from "@/components/chat/ChatMessages";
import ChatSidebar from "@/components/chat/sidebar/ChatSidebar";
import Head from "next/head";
import React, { useEffect, useState } from "react";
import { useOpenAI } from "@/context/OpenAIProvider";
import ChatHeader from "@/components/chat/ChatHeader";
import Router from "next/router";

export default function Chat() {
  const { clearConversation } = useOpenAI();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    clearConversation();
    const { pathname } = Router;
    if (pathname == "/") {
      Router.push("/playground");
    }
  }, []);

  return (
    <React.Fragment>
      <Head>
        <title>ReFlow</title>
        <meta
          name="description"
          content="Refactor your prompts without breaking any key user flows"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {!loaded && (<></>
        // <div className="max-w-screen relative h-screen max-h-screen w-screen overflow-hidden">
        //   <ChatHeader />
        //   <ChatMessages />
        //   <ChatSidebar />
        // </div>
      )}
    </React.Fragment>
  );
}
