"use client";

import { type MouseEvent, useEffect, useMemo, useState } from "react";
import {
  chapterContentByHash,
  chapterContents,
} from "./chapter-data";

type Chapter = {
  num: string;
  title: string;
};

type Part = {
  title: string;
  en: string;
  chapters: Chapter[];
};

const DEFAULT_CHAPTER_HASH = "#ch16";

const parts: Part[] = [
  {
    title: "第一卷 · 格局重置",
    en: "Part I · The Reset",
    chapters: [
      { num: "1", title: "代码不再是中心产物" },
      { num: "2", title: "什么过时了，什么降级了，什么反而更重要" },
      { num: "3", title: "角色之争：SDE 会消失，还是会升舱" },
      { num: "4", title: "三条路线正在汇合" },
      { num: "5", title: "前沿 SDE 的工程原则" },
    ],
  },
  {
    title: "第二卷 · 软件工程基础与 AI 时代重校",
    en: "Part II · Software Engineering Foundations, Recalibrated",
    chapters: [
      { num: "6", title: "需求与问题定义的重定价" },
      { num: "7", title: "架构、模块化与契约的重定价" },
      { num: "8", title: "代码质量与可维护性的重定价" },
      { num: "9", title: '测试与验证的重定价：从"测代码"到"测 agent"' },
    ],
  },
  {
    title: "第三卷 · 新工程资产",
    en: "Part III · The New Engineering Assets",
    chapters: [
      { num: "10", title: "repo 指令文件：AGENTS.md / CLAUDE.md" },
      { num: "11", title: "Context 工程：让 agent 在正确范围内变聪明" },
      { num: "12", title: "状态与交接工件：让长任务可恢复" },
      { num: "13", title: "Tool 工程与 MCP：工具是给 agent 用的界面" },
      { num: "14", title: "Agent Skills：把专业能力打包复用" },
    ],
  },
  {
    title: "第四卷 · HARNESS 工程专章",
    en: "Part IV · Harness Engineering",
    chapters: [
      { num: "15", title: "Harness 是什么，不是什么" },
      { num: "16", title: "Harness 的 9 层参考架构" },
      { num: "17", title: "Sandbox、权限与安全：强 agent 需要强边界" },
      { num: "18", title: "Eval：没有评估就没有自治" },
      { num: "19", title: "Trace 与可观测性：新的代码评审材料" },
      { num: "20", title: "成熟度模型与企业落地" },
    ],
  },
  {
    title: "第五卷 · AGENTS 工程专章",
    en: "Part V · Agents Engineering",
    chapters: [
      { num: "21", title: "一个 agent 是一个工作单元，不是一个 prompt" },
      { num: "22", title: "多 agent 模式" },
      { num: "23", title: "Managed agents 与 subagents：把脑和手解耦" },
      { num: "24", title: "Agents 工程反模式合集" },
    ],
  },
  {
    title: "第六卷 · 三大 CODING AGENT 实战对比",
    en: "Part VI · Claude Code / Codex / Copilot in Practice",
    chapters: [
      { num: "25", title: "三者定位与工作流差异" },
      { num: "26", title: "写 agent-ready issue 与 repo 指令" },
      { num: "27", title: "Review、rollback 与 Claude Code 的工程精神" },
    ],
  },
  {
    title: "第七卷 · AGENTIC 项目管理",
    en: "Part VII · Agentic Project Management",
    chapters: [
      { num: "28", title: "从排人天到排 agent-ready work" },
      { num: "29", title: "新度量与失败分类学" },
    ],
  },
  {
    title: "第八卷 · 学习路径与 CAPSTONE",
    en: "Part VIII · Learning Path & Capstone",
    chapters: [
      { num: "30", title: "按模块的学习路线（不按天）" },
      { num: "31", title: "Capstone：为真实 repo 设计 agentic SDE harness" },
    ],
  },
  {
    title: "第九卷 · 模板附录",
    en: "Part IX · Template Appendix",
    chapters: [{ num: "32", title: "工程模板合集" }],
  },
];

function chapterHash(num: string) {
  return `#ch${num.padStart(2, "0")}`;
}

function getChapterFromHash(hash: string) {
  return (
    chapterContentByHash.get(hash) ??
    chapterContentByHash.get(DEFAULT_CHAPTER_HASH) ??
    chapterContents[0]
  );
}

function Sidebar({
  activeChapterHash,
  activeSectionHash,
  onNavigate,
}: {
  activeChapterHash: string;
  activeSectionHash: string;
  onNavigate: (href: string, event: MouseEvent<HTMLAnchorElement>) => void;
}) {
  return (
    <nav className="sidebar-nav" aria-label="章节目录">
      {parts.map((part) => (
        <section className="toc-part" key={part.title}>
          <div className="part-title">
            <span>{part.title}</span>
            <span className="part-en">{part.en}</span>
          </div>
          {part.chapters.map((chapter) => {
            const href = chapterHash(chapter.num);
            const isActive = href === activeChapterHash;

            return (
              <div key={chapter.num}>
                <a
                  className={`toc-link ${isActive ? "active" : ""}`}
                  href={href}
                  onClick={(event) => onNavigate(href, event)}
                >
                  <span className="chapter-num">{chapter.num}</span>
                  <span className="chapter-title">{chapter.title}</span>
                </a>

                {isActive ? (
                  <div className="toc-children">
                    <a
                      className={`toc-child ${
                        activeSectionHash === "#checklist"
                          ? "active-child"
                          : ""
                      }`}
                      href="#checklist"
                      onClick={(event) => onNavigate("#checklist", event)}
                    >
                      检查清单
                    </a>
                    <a
                      className={`toc-child ${
                        activeSectionHash === "#self-test"
                          ? "active-child"
                          : ""
                      }`}
                      href="#self-test"
                      onClick={(event) => onNavigate("#self-test", event)}
                    >
                      自测
                    </a>
                  </div>
                ) : null}
              </div>
            );
          })}
        </section>
      ))}
    </nav>
  );
}

function scrollSidebarToActiveChapter(selector: string) {
  const sidebar = document.querySelector<HTMLElement>(selector);
  const activeChapter = sidebar?.querySelector<HTMLElement>(".toc-link.active");

  if (!sidebar || !activeChapter) {
    return;
  }

  sidebar.scrollTop = Math.max(
    0,
    activeChapter.offsetTop - sidebar.clientHeight * 0.42,
  );
}

function scrollToTopOfArticle() {
  document
    .getElementById("top")
    ?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function EmptySection() {
  return (
    <p className="empty-note">
      这一章在原站没有单独的检查清单和自测小节。当前仿站版本仍保留章节标题切换和目录定位。
    </p>
  );
}

function SectionText({ items }: { items: string[] }) {
  if (!items.length) {
    return null;
  }

  return items.map((item) => <p key={item}>{item}</p>);
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeChapterHash, setActiveChapterHash] =
    useState(DEFAULT_CHAPTER_HASH);
  const [activeSectionHash, setActiveSectionHash] = useState("#checklist");

  const activeChapter = useMemo(
    () => getChapterFromHash(activeChapterHash),
    [activeChapterHash],
  );
  const previousChapter = chapterContents.find(
    (chapter) => chapter.id === activeChapter.id - 1,
  );
  const nextChapter = chapterContents.find(
    (chapter) => chapter.id === activeChapter.id + 1,
  );

  const navigateToHash = (
    href: string,
    event: MouseEvent<HTMLAnchorElement>,
  ) => {
    event.preventDefault();

    if (chapterContentByHash.has(href)) {
      setActiveChapterHash(href);
      setActiveSectionHash("#checklist");
      window.history.pushState(null, "", href);
      setMenuOpen(false);
      window.requestAnimationFrame(scrollToTopOfArticle);
      return;
    }

    const target = document.getElementById(href.replace("#", ""));
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveSectionHash(href);
      window.history.pushState(null, "", href);
    }

    setMenuOpen(false);
  };

  useEffect(() => {
    const syncHash = () => {
      const hash = window.location.hash || DEFAULT_CHAPTER_HASH;

      if (chapterContentByHash.has(hash)) {
        setActiveChapterHash(hash);
        setActiveSectionHash("#checklist");
        return;
      }

      if (hash === "#checklist" || hash === "#self-test") {
        setActiveSectionHash(hash);
        return;
      }

      setActiveChapterHash(DEFAULT_CHAPTER_HASH);
      setActiveSectionHash("#checklist");
      window.history.replaceState(null, "", DEFAULT_CHAPTER_HASH);
    };

    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, []);

  useEffect(() => {
    scrollSidebarToActiveChapter(".desktop-sidebar");
  }, [activeChapterHash]);

  useEffect(() => {
    document.body.classList.toggle("drawer-open", menuOpen);
    if (menuOpen) {
      window.requestAnimationFrame(() => {
        scrollSidebarToActiveChapter(".mobile-drawer");
      });
    }

    return () => document.body.classList.remove("drawer-open");
  }, [menuOpen]);

  const hasChecklist = activeChapter.checklist.length > 0;
  const hasSelfTest = activeChapter.selfTest.length > 0;

  return (
    <>
      <header className="topbar">
        <button
          className="icon-button menu-button"
          type="button"
          aria-label="打开目录"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          ☰
        </button>
        <a
          className="brand"
          href={DEFAULT_CHAPTER_HASH}
          onClick={(event) => navigateToHash(DEFAULT_CHAPTER_HASH, event)}
        >
          <span className="brand-mark">Agentic SDE</span>
          <span className="brand-sub">软件工程手册</span>
        </a>
        <div className="topbar-spacer" />
        <button className="search-button" type="button" aria-label="搜索">
          <span>⌕</span>
          <span className="search-key">/</span>
        </button>
        <div className="language-toggle" aria-label="语言切换">
          <span>EN</span>
          <strong>中文</strong>
        </div>
      </header>

      <div className="layout">
        <aside className="sidebar desktop-sidebar">
          <Sidebar
            activeChapterHash={activeChapterHash}
            activeSectionHash={activeSectionHash}
            onNavigate={navigateToHash}
          />
        </aside>

        <div
          className={`drawer-scrim ${menuOpen ? "visible" : ""}`}
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />

        <aside className={`sidebar mobile-drawer ${menuOpen ? "open" : ""}`}>
          <Sidebar
            activeChapterHash={activeChapterHash}
            activeSectionHash={activeSectionHash}
            onNavigate={navigateToHash}
          />
        </aside>

        <main className="content">
          <article id="top" className="article">
            {activeChapter.kicker ? (
              <p className="kicker">{activeChapter.kicker}</p>
            ) : null}
            <h1>{activeChapter.title}</h1>
            <div className="rule" />

            <section id="checklist" className="article-section">
              <h2>检查清单</h2>
              {hasChecklist ? (
                <SectionText items={activeChapter.checklist} />
              ) : (
                <EmptySection />
              )}
            </section>

            <section id="self-test" className="article-section">
              <h2>自测</h2>
              {hasSelfTest ? (
                <SectionText items={activeChapter.selfTest} />
              ) : (
                <EmptySection />
              )}
            </section>

            <nav className="chapter-nav" aria-label="章节导航">
              {previousChapter ? (
                <a
                  href={previousChapter.hash}
                  onClick={(event) => navigateToHash(previousChapter.hash, event)}
                >
                  <span className="nav-label">上一章</span>
                  <span>{previousChapter.title}</span>
                </a>
              ) : (
                <span />
              )}
              {nextChapter ? (
                <a
                  href={nextChapter.hash}
                  onClick={(event) => navigateToHash(nextChapter.hash, event)}
                >
                  <span className="nav-label">下一章</span>
                  <span>{nextChapter.title}</span>
                </a>
              ) : (
                <span />
              )}
            </nav>
          </article>
        </main>
      </div>
    </>
  );
}
