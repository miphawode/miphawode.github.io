"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { type ChangeEvent, useEffect, useMemo, useRef, useState } from "react";

type EditorImage = {
  id: string;
  src: string;
  alt: string;
};

type EditorDraft = {
  title: string;
  body: string;
  images: EditorImage[];
};

const STORAGE_KEY = "page-repository-editor-draft-v1";
const DEFAULT_TITLE = "Git 功能笔记";
const DEFAULT_BODY = `这页用来记录 Git 的常用功能和排错经验。核心目标不是背命令，而是知道每个命令解决什么问题、什么时候该用、什么时候不要乱用。

一、Git 是什么

Git 是一个版本控制工具。它帮我们记录项目每次修改，让我们知道改了哪些文件、什么时候改的、为什么改，以及出了问题时怎么回到上一版。

在这个项目里，Git 主要承担三件事：保存页面源码、把修改推送到 GitHub、触发 GitHub Pages 自动构建。

二、最常用流程

每次改页面前，先看当前状态：

git status

改完之后，把文件加入本次提交：

git add .

提交一版说明：

git commit -m "说明这次改了什么"

推送到 GitHub：

git push

这四步是日常主流程。注意：git push 只会推送已经 commit 的内容，没有 commit 的文件不会上传。

三、git status

git status 用来查看当前仓库状态。它会告诉你：

哪些文件被修改了。
哪些文件还没有加入暂存区。
哪些文件已经准备提交。
当前分支是否和远程 GitHub 同步。

如果它显示 working tree clean，说明当前没有未提交修改。

四、git add

git add 是把修改加入暂存区。暂存区可以理解为“这次准备提交的清单”。

git add . 表示添加当前目录下所有改动。

如果只想提交某个文件，可以写：

git add app/chapter-data.ts

五、git commit

git commit 是真正保存一个版本。commit 信息要写清楚这次改了什么。

好的提交说明：

新增 Git 功能笔记页
修复章节内容逗号错误
更新第 2 章自测答案

不太好的提交说明：

修改
111
更新

六、git push

git push 是把本地提交推送到 GitHub。推送成功不等于页面立刻更新。

这个项目推送后还需要等待 GitHub Actions 构建，构建成功后 GitHub Pages 才会更新。

如果页面没有变化，先检查：

GitHub Actions 有没有绿色成功。
是不是改了别的章节，但当前页面还停在原章节。
浏览器是否缓存了旧页面，可以加 ?v=数字 刷新。

七、git pull

git pull 是把 GitHub 上的最新代码拉回本地。

如果你在 Mac 和 Windows 两台电脑上改同一个项目，每次开始前先运行：

git pull

这样可以减少冲突。

八、分支 branch

分支可以理解成一条独立的修改线。主分支通常叫 master 或 main。

查看当前分支：

git branch

创建并切换到新分支：

git switch -c 分支名

切回 master：

git switch master

本项目目前日常可以直接在 master 上改，但如果以后改动很大，可以新建分支。

九、回滚

如果还没 commit，只是本地改坏了，可以恢复某个文件：

git restore 文件名

如果已经 commit 但还没 push，可以撤回最后一次提交：

git reset HEAD~1

如果已经 push 到 GitHub，推荐用 revert：

git revert HEAD
git push

已经推送到远程的错误，不建议直接 reset 后强推，因为容易破坏历史。

十、冲突 conflict

冲突通常发生在两台电脑或两个人改了同一段内容。Git 不知道该保留哪一版，就会要求你手动处理。

处理冲突的基本顺序：

打开冲突文件。
找到 Git 标记出来的两段内容。
保留正确版本，删掉冲突标记。
运行 npm run lint 和 npm run build。
重新 git add、git commit、git push。

十一、我们这个项目的发布流程

本项目不是直接把源码当网页发布，而是：

git push
GitHub Actions 安装依赖
运行 lint
运行 build
导出 out 静态文件
GitHub Pages 发布 out

所以页面 404 或没更新时，不要只看 git push 是否成功，还要看 Actions 是否成功。

十二、常见错误

错误一：push 后页面没变。

原因可能是 Actions 还没跑完，或者浏览器缓存，或者你改的是另一个章节。

错误二：Actions 失败。

先看失败步骤。如果是 lint，通常是代码格式或语法错误。如果是 build，通常是 TypeScript、路径或页面构建错误。

错误三：页面 404。

先检查 GitHub Pages 是否使用 workflow 发布。如果错误地从 master 根目录发布，而仓库根目录是源码，就可能 404。

十三、这页后续可以继续补充

可以在这里继续记录：

GitHub Actions 的报错案例。
GitHub Pages 的发布经验。
常用命令的中文解释。
每次踩坑后的解决步骤。
配图、流程图、截图和命令输出。`;

function createId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function splitParagraphs(text: string) {
  return text
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

export default function EditorPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState(DEFAULT_TITLE);
  const [body, setBody] = useState(DEFAULT_BODY);
  const [images, setImages] = useState<EditorImage[]>([]);
  const [imageUrl, setImageUrl] = useState("");
  const [status, setStatus] = useState("未保存");

  const paragraphs = useMemo(() => splitParagraphs(body), [body]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const saved = window.localStorage.getItem(STORAGE_KEY);

      if (!saved) {
        return;
      }

      try {
        const draft = JSON.parse(saved) as EditorDraft;
        setTitle(draft.title ?? DEFAULT_TITLE);
        setBody(draft.body ?? DEFAULT_BODY);
        setImages(Array.isArray(draft.images) ? draft.images : []);
        setStatus("已载入");
      } catch {
        setStatus("草稿损坏");
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const saveDraft = () => {
    const draft: EditorDraft = { title, body, images };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    setStatus("已保存");
  };

  const clearDraft = () => {
    setTitle(DEFAULT_TITLE);
    setBody(DEFAULT_BODY);
    setImages([]);
    setImageUrl("");
    window.localStorage.removeItem(STORAGE_KEY);
    setStatus("已清空");
  };

  const addImageFromUrl = () => {
    const src = imageUrl.trim();

    if (!src) {
      return;
    }

    setImages((current) => [
      ...current,
      { id: createId(), src, alt: "图片" },
    ]);
    setImageUrl("");
    setStatus("有未保存修改");
  };

  const addImageFiles = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []).filter((file) =>
      file.type.startsWith("image/"),
    );

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result !== "string") {
          return;
        }

        setImages((current) => [
          ...current,
          { id: createId(), src: reader.result as string, alt: file.name },
        ]);
        setStatus("有未保存修改");
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const updateImageAlt = (id: string, alt: string) => {
    setImages((current) =>
      current.map((image) => (image.id === id ? { ...image, alt } : image)),
    );
    setStatus("有未保存修改");
  };

  const removeImage = (id: string) => {
    setImages((current) => current.filter((image) => image.id !== id));
    setStatus("有未保存修改");
  };

  return (
    <>
      <header className="topbar editor-topbar">
        <Link className="brand" href="/">
          <span className="brand-mark">Agentic SDE</span>
          <span className="brand-sub">软件工程手册</span>
        </Link>
        <div className="topbar-spacer" />
        <Link className="topbar-link" href="/">
          阅读页
        </Link>
      </header>

      <main className="editor-page">
        <section className="editor-workspace" aria-label="编辑区">
          <div className="editor-pane">
            <div className="editor-toolbar">
              <span className="editor-status">{status}</span>
              <button type="button" onClick={saveDraft}>
                保存
              </button>
              <button type="button" onClick={clearDraft}>
                清空
              </button>
            </div>

            <label className="editor-label" htmlFor="editor-title">
              标题
            </label>
            <input
              id="editor-title"
              className="editor-title-input"
              value={title}
              onChange={(event) => {
                setTitle(event.target.value);
                setStatus("有未保存修改");
              }}
            />

            <label className="editor-label" htmlFor="editor-body">
              正文
            </label>
            <textarea
              id="editor-body"
              className="editor-textarea"
              value={body}
              onChange={(event) => {
                setBody(event.target.value);
                setStatus("有未保存修改");
              }}
              placeholder="继续补充 Git 功能笔记..."
            />

            <div className="image-controls">
              <input
                ref={fileInputRef}
                className="file-input"
                type="file"
                accept="image/*"
                multiple
                onChange={addImageFiles}
              />
              <input
                className="image-url-input"
                value={imageUrl}
                onChange={(event) => setImageUrl(event.target.value)}
                placeholder="https://..."
              />
              <button type="button" onClick={addImageFromUrl}>
                添加图片
              </button>
            </div>

            <div className="image-list">
              {images.map((image) => (
                <div className="image-item" key={image.id}>
                  <img src={image.src} alt={image.alt} />
                  <input
                    value={image.alt}
                    onChange={(event) =>
                      updateImageAlt(image.id, event.target.value)
                    }
                    aria-label="图片说明"
                  />
                  <button type="button" onClick={() => removeImage(image.id)}>
                    删除
                  </button>
                </div>
              ))}
            </div>
          </div>

          <article className="editor-preview" aria-label="预览">
            <p className="kicker">页面预览</p>
            <h1>{title || DEFAULT_TITLE}</h1>
            <div className="rule" />
            {paragraphs.length > 0 ? (
              paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)
            ) : (
              <p className="empty-note">暂无正文</p>
            )}
            {images.length > 0 ? (
              <div className="preview-images">
                {images.map((image) => (
                  <figure key={image.id}>
                    <img src={image.src} alt={image.alt} />
                    {image.alt ? <figcaption>{image.alt}</figcaption> : null}
                  </figure>
                ))}
              </div>
            ) : null}
          </article>
        </section>
      </main>
    </>
  );
}
