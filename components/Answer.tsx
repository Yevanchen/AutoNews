import { FC, useEffect, useRef } from 'react';
import { SearchQuery } from "@/types";
import { IconReload } from "@tabler/icons-react";
import { MemoizedReactMarkdown } from './ui/markdown'

interface AnswerProps {
  searchQuery: SearchQuery;
  answer: string;
  done: boolean;
  onReset: () => void;
}

export const Answer: FC<AnswerProps> = ({ searchQuery, answer, done, onReset }) => {
  const markdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (markdownRef.current) {
      const links = markdownRef.current.querySelectorAll('a');
      links.forEach(link => {
        const match = link.textContent?.match(/\[([0-9]+)\]/);
        if (match) {
          const index = parseInt(match[1], 10) - 1;
          const newLink = searchQuery.sourceLinks[index] || "#";
          link.setAttribute('href', newLink);
          link.setAttribute('target', '_blank');
          link.setAttribute('rel', 'noopener noreferrer');
          link.setAttribute('title', 'Open in new tab');
        }
      });
    }
  }, [searchQuery.sourceLinks, answer]);  // 依赖数组确保更新

  return (
    <div className="max-w-[1000px] mx-auto space-y-4 py-16 px-8 sm:px-24 sm:pt-12 pb-32 overflow-auto" style={{ maxHeight: "90vh" }}>
      <div className="overflow-auto text-2xl sm:text-4xl font-georgia font-bold">{searchQuery.query}</div>
      <div className="rounded-lg bg-white shadow-lg p-4 sm:p-6">
        <div className="border-b border-zinc-800 pb-4">
          <div className="text-md text-blue-500 font-georgia">Answer</div>
          <div className="mt-2 overflow-auto font-georgia" ref={markdownRef}>
            <MemoizedReactMarkdown className="prose-sm prose-neutral">
              {answer}
            </MemoizedReactMarkdown>
          </div>
        </div>

        {done && (
          <>
            <div className="border-b border-zinc-800 pb-4">
              <div className="text-md text-blue-500 font-georgia">Sources</div>
              {searchQuery.sourceLinks.map((source, index) => (
                <div key={index} className="mt-1 overflow-auto">
                  {`[${index + 1}] `}
                  <a className="hover:cursor-pointer hover:underline" target="_blank" rel="noopener noreferrer" href={source}>
                    {source.split("//")[1].split("/")[0].replace("www.", "")}
                  </a>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {done && (
        <button className="flex h-10 w-52 items-center justify-center rounded-full bg-blue-500 p-2 hover:bg-blue-600 mt-4" onClick={onReset}>
          <IconReload size={18} />
          <div className="ml-2">Ask New Question</div>
        </button>
      )}
    </div>
  );
};
