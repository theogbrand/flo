import { useAuth } from "@/context/AuthProvider";
import React from "react";
import { MdClose, MdToken } from "react-icons/md";
import { usePostHog } from "posthog-js/react";

type Props = {
  className?: string;
};

export default function AddTokenModal({ className }: Props) {
  const { token, addToken, clearToken } = useAuth();
  const [open, setOpen] = React.useState(true);
  const [input, setInput] = React.useState(token);

  const posthog = usePostHog();

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleClear = () => {
    clearToken();
    setOpen(false);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    addToken(input);
    setOpen(false);
    posthog.capture("API Token submitted for use!", {
      brandon_capture_timestamp: new Date().toISOString(),
    });
  };

  return (
    <>
      <button
        className={`hidden rounded bg-green-500 p-4 text-white hover:bg-green-600 md:block ${className}`}
        onClick={() => setOpen(true)}
      >
        Add your API token
      </button>
      <button
        className={`flex items-center gap-x-1 rounded bg-green-500 p-4 text-white hover:bg-green-600 md:hidden ${className}`}
        onClick={() => setOpen(true)}
      >
        <MdToken /> Api Key
      </button>
      {open && (
        <div className="absolute left-0 top-0 z-50 flex h-full w-full items-center justify-center bg-black bg-opacity-50 transition-all">
          <div className="relative m-4 max-w-2xl rounded bg-tertiary p-4 shadow-xl">
            <div className="absolute right-0 top-0 m-2">
              <button
                className="rounded p-2 text-primary hover:bg-primary/50"
                onClick={() => setOpen(false)}
              >
                <MdClose />
              </button>
            </div>
            <h1 className="text-2xl font-medium text-primary">
              Your API token
            </h1>
            <p className="mt-4 text-lg text-primary/80">
              We ONLY use this to compensate OpenAI for usage of their services.
              You can get your API token from the{" "}
              <a
                href="https://beta.openai.com/account/api-keys"
                target="_blank"
                rel="noreferrer"
                className="text-primary hover:underline"
              >
                OpenAI dashboard
              </a>{" "}
              or by asking your tech team for it. Not to worry, we do not save
              your API token on our servers, it is stored securely on your
              browser - you can also clear your token whenever! In the future,
              we&apos;ll remove the need for this once we have a proper billing
              system =)
            </p>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="sk-NhU98cac878..."
                className="mt-4 w-full rounded border-none bg-secondary p-4 text-primary outline-none"
                onChange={handleInput}
                value={input}
              />
              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  className="mr-2 rounded px-4 py-2 text-primary hover:bg-primary/50"
                  onClick={handleClear}
                >
                  Clear Token
                </button>
                <button
                  type="submit"
                  className="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600"
                >
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
