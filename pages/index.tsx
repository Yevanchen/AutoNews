import { Answer } from "@/components/Answer";
import { Search } from "@/components/Search";
import { SearchQuery } from "@/types";
import { isDemoMode } from "@/utils/demo";
import { IconBrandGithub, IconBrandTwitter } from "@tabler/icons-react";
import type { GetStaticProps } from "next";
import Head from "next/head";
import { useState } from "react";

interface HomeProps {
  demoMode: boolean;
}

export const getStaticProps: GetStaticProps<HomeProps> = async () => ({
  props: { demoMode: isDemoMode() }
});

export default function Home({ demoMode }: HomeProps) {
  const [searchQuery, setSearchQuery] = useState<SearchQuery>({ query: "", sourceLinks: [] });
  const [answer, setAnswer] = useState<string>("");
  const [done, setDone] = useState<boolean>(false);

  return (
    <>
      <Head>
        <title>Autonews</title>
        <meta name="description" content="AI-powered search." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.png" />
      </Head>
      {/* 使用flex布局实现内容居中，并将背景色调整为米色纸信封的颜色 */}
      <div className="flex h-screen flex-col items-center justify-center overflow-auto bg-[#f3ebe1] text-[#18181C]">
        {/* 社交媒体图标位置调整，根据需要调整 */}
        <div className="absolute top-0 right-12 p-4">
          <a href="https://twitter.com/XchenEvan" target="_blank" rel="noreferrer">
            <IconBrandTwitter />
          </a>
        </div>
        <div className="absolute top-0 right-2 p-4">
          <a href="https://github.com/Yevanchen" target="_blank" rel="noreferrer">
            <IconBrandGithub />
          </a>
        </div>
        {/* 主要内容区域 */}
        {answer ? (
          <Answer
            searchQuery={searchQuery}
            answer={answer}
            done={done}
            onReset={() => {
              setAnswer("");
              setSearchQuery({ query: "", sourceLinks: [] });
              setDone(false);
            }}
          />
        ) : (
          <Search
            demoMode={demoMode}
            onSearch={setSearchQuery}
            onAnswerUpdate={(value) => setAnswer((prev) => prev + value)}
            onDone={setDone}
          />
        )}
      </div>
    </>
  );
  
}
