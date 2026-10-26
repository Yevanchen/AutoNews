import { SearchQuery, Source } from "@/types";
import { DEMO_STOP_MESSAGE } from "@/utils/demo";
import { IconArrowRight, IconSearch } from "@tabler/icons-react";
import endent from "endent";
import { FC, KeyboardEvent, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import { EmojiGrid, EmojiItem } from "@/components/ui/EmojiGrid";


interface SearchProps {
  demoMode: boolean;
  onSearch: (searchResult: SearchQuery) => void;
  onAnswerUpdate: (answer: string) => void;
  onDone: (done: boolean) => void;
}

export const Search: FC<SearchProps> = ({ demoMode, onSearch, onAnswerUpdate, onDone }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedText, setSelectedText] = useState<string>("");

  const [query, setQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [hasApiKey, setHasApiKey] = useState<boolean>(false);
  const [stopped, setStopped] = useState<boolean>(false);
  const canSearch = demoMode || hasApiKey;
  const headlines: EmojiItem[] = [
    { emoji: "🌐", text: "Meta开放其Horizon OS给第三方" },
    { emoji: "🍏", text: "苹果公司收购了另一家人工智能初创公司" },
    { emoji: "🔋", text: "New rapidly charging sodium battery" },
    { emoji: "🗓", text: "WWDC24 有哪些值得关注的话题" },
    { emoji: "⚖️", text: ".SBF被判25年监禁" },
    { emoji: "🚗", text: "Tesla vs Rivian" },
    { emoji: "🤔", text: "Is the Apple Vision Pro worth buying?" },
    { emoji: "🛠", text: "写一篇关于Tesla recalling all Cybertrucks的新闻报导" },
    { emoji: "🌒", text: "The Great North American Eclipse" },
    { emoji: "💸", text: "The Fed transfers $2 billion in confiscated Bitcoin" },
    { emoji: "🍟", text: "荷兰麦当劳的创新营销活动。" },
    { emoji: "🎵", text: "Billie Eilish opposes AI-made music" },
    { emoji: "🎙", text: "Drake uses AI Tupac to record songs" },
    { emoji: "🚫", text: "美国众议院拟禁止TikTok。" }
  ];
  
  const updateQuery = (newQuery: string) => {
    setQuery(newQuery);
  };

  const handleSearch = async (text: string = query) => {
    if (demoMode) {
      await handleDemoSearch(text.trim());
      return;
    }

    setLoading(true);
    const sources = await fetchSources();
    await handleStream(sources);
  };

  // 演示模式：只有推荐头条有缓存的回答，其他问题一律提示已停止运营，不调用 OpenAI
  const handleDemoSearch = async (text: string) => {
    if (!text) {
      return;
    }

    if (!headlines.some((headline) => headline.text === text)) {
      setStopped(true);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/demo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ query: text })
      });

      if (!response.ok) {
        throw new Error(response.statusText);
      }

      const { answer, sourceLinks }: { answer: string; sourceLinks: string[] } = await response.json();
      setLoading(false);
      onSearch({ query: text, sourceLinks });

      // 分段输出缓存的回答，模拟实时生成的效果
      for (let i = 0; i < answer.length; i += 10) {
        onAnswerUpdate(answer.slice(i, i + 10));
        await new Promise((resolve) => setTimeout(resolve, 12));
      }

      onDone(true);
    } catch (err) {
      setLoading(false);
      setStopped(true);
    }
  };

  const fetchSources = async () => {
    const response = await fetch("/api/sources", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ query })
    });

    if (!response.ok) {
      setLoading(false);
      throw new Error(response.statusText);
    }

    const { sources }: { sources: Source[] } = await response.json();
    return sources;
  };
  const handleEmojiClick = (text: string) => {
    setSelectedText(text);
    updateQuery(text); // 假设 updateQuery 函数可以处理这个更新
    // 演示模式下点击头条直接展示缓存的回答
    if (demoMode) {
      handleSearch(text);
    }
};
  const handleStream = async (sources: Source[]) => {
    try {
      const prompt = endent`[...prompt content...] ${sources.map((source, idx) => `Source [${idx + 1}]:\n${source.text}`).join("\n\n")}`;

      const response = await fetch("/api/answer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ prompt })
      });

      if (!response.ok) {
        setLoading(false);
        throw new Error(response.statusText);
      }

      setLoading(false);
      onSearch({ query, sourceLinks: sources.map((source) => source.url) });

      const data = response.body;
      if (!data) {
        return;
      }

      const reader = data.getReader();
      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunkValue = decoder.decode(value);
        onAnswerUpdate(chunkValue);
      }

      onDone(true);
    } catch (err) {
      onAnswerUpdate("Error");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  useEffect(() => {
    const checkApiKey = async () => {
      const response = await fetch("/api/getApiKey");
      const data = await response.json();
      setHasApiKey(data.hasApiKey);
    };

    checkApiKey();
    inputRef.current?.focus();
  }, []);

  return (
    <>
      {loading ? (
        <div className="flex items-center justify-center pt-64 sm:pt-72 flex-col bg-[#f3ebe1]">
          <div className="inline-block h-16 w-16 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <div className="mt-8 text-2xl">Getting answer...</div>
        </div>
      ) : (
        <div className="mx-auto flex h-full w-full max-w-[2000px] flex-col items-center space-y-6 px-3 pt-20 sm:pt-64 bg-[#f3ebe1]">
          <div className="flex items-center">
            <img src="/title.png" alt="AutoNews" style={{ width: '380px', height: 'auto' }} />
          </div>

          <div className="flex w-full max-w-2xl items-center space-x-2"> {/* Increase max-w-lg to max-w-2xl */}
          <Input
            ref={inputRef}
            className="flex-1 rounded-lg border border-zinc-800 bg-white py-2 pr-16 pl-11 focus:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-800"
            type="text"
            placeholder="今天发生了什么"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setStopped(false);
            }}
            onKeyDown={handleKeyDown}
          />
          <Button
            disabled={!canSearch}
            onClick={() => handleSearch()}
            className={`h-10 rounded-lg px-4 ${canSearch ? 'bg-black hover:bg-gray-800 text-white' : 'bg-gray-500 text-gray-200'} hover:cursor-pointer`}
          >
            Search
          </Button>
         
        </div>
        {demoMode && (
          <div
            role="status"
            className={`w-full max-w-2xl rounded-lg px-4 py-2 text-center text-sm ${stopped ? "border border-amber-400 bg-amber-50 text-amber-900" : "text-zinc-500"}`}
          >
            {stopped ? DEMO_STOP_MESSAGE : "演示模式：点击下方推荐头条，查看缓存的回答 · Demo mode: pick a headline below"}
          </div>
        )}
        <EmojiGrid items={headlines} onEmojiClick={handleEmojiClick} />

          
        </div>
      )}
    </>
  );
  
};
