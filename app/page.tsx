"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { Bookmark, Check, ChevronRight, Clock3, Compass, Layers3, Menu, Palette, RefreshCw, Search, Sparkles, X } from "lucide-react";
import { SignInButton, Show, UserButton } from "@clerk/nextjs";
import type { IntelligenceResponse, TechItem, Topic } from "@/types/intelligence";

const TOPICS: (Topic | "All")[] = ["All", "AI Agents", "RAG", "MCP / A2A", "Microsoft / Teams", "React", "TypeScript", "Python", "Programming Languages", "Cloud", "Cloud Native", "Data / Databases", "Open Source", "Security", "Developer Tools"];
const clerkConfigured = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

function relativeTime(date: string) {
  const hours = Math.max(0, (Date.now() - new Date(date).getTime()) / 36e5);
  if (hours < 1) return "Just now";
  if (hours < 24) return `${Math.floor(hours)}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function Home() {
  const [data, setData] = useState<IntelligenceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [topic, setTopic] = useState<Topic | "All">("All");
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"Briefing" | "Discover" | "Saved" | "Learning">("Briefing");
  const [saved, setSaved] = useState<string[]>(() => typeof window === "undefined" ? [] : JSON.parse(localStorage.getItem("signal-saved") ?? "[]"));
  const [learning, setLearning] = useState<string[]>(() => typeof window === "undefined" ? [] : JSON.parse(localStorage.getItem("signal-learning") ?? "[]"));
  const [mobileNav, setMobileNav] = useState(false);
  const [dateLabel, setDateLabel] = useState("TODAY");
  const [theme, setTheme] = useState<"signal" | "midnight" | "ocean" | "sunset">(() => typeof window === "undefined" ? "signal" : (localStorage.getItem("signal-theme") as "signal" | "midnight" | "ocean" | "sunset") ?? "signal");

  async function load(force = false) {
    setLoading(true);
    try {
      const response = await fetch(`/api/intelligence${force ? "?refresh=1" : ""}`, { cache: "no-store" });
      setData(await response.json());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    let active = true;
    fetch("/api/intelligence", { cache: "no-store" })
      .then((response) => response.json())
      .then((nextData: IntelligenceResponse) => {
        if (active) {
          setData(nextData);
          setDateLabel(`${new Intl.DateTimeFormat("en", { weekday: "long", month: "long", day: "numeric" }).format(new Date()).toUpperCase()}`);
        }
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  function persist(key: string, value: string[]) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function cycleTheme() {
    const themes = ["signal", "midnight", "ocean", "sunset"] as const;
    const next = themes[(themes.indexOf(theme) + 1) % themes.length];
    setTheme(next);
    localStorage.setItem("signal-theme", next);
  }

  function toggleSaved(id: string) {
    const next = saved.includes(id) ? saved.filter((item) => item !== id) : [...saved, id];
    setSaved(next); persist("signal-saved", next);
  }

  function toggleLearning(id: string) {
    const next = learning.includes(id) ? learning.filter((item) => item !== id) : [...learning, id];
    setLearning(next); persist("signal-learning", next);
  }

  const items = useMemo(() => {
    const all = data?.items ?? [];
    let filtered = all;
    if (view === "Saved") filtered = all.filter((item) => saved.includes(item.id));
    if (view === "Learning") filtered = all.filter((item) => learning.includes(item.id));
    if (topic !== "All") filtered = filtered.filter((item) => item.topics.includes(topic));
    if (search.trim()) {
      const needle = search.toLowerCase();
      filtered = filtered.filter((item) => `${item.title} ${item.summary} ${item.source}`.toLowerCase().includes(needle));
    }
    return filtered;
  }, [data, topic, search, view, saved, learning]);

  const briefing = items.slice(0, 5);

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileNav ? "mobile-open" : ""}`}>
        <button className="close-nav" onClick={() => setMobileNav(false)} aria-label="Close navigation"><X size={18}/></button>
        <div className="brand"><Image className="brand-mark" src="/logo.svg" alt="" width={34} height={34}/><span>Signal</span></div>
        <nav>
          <button className={view === "Briefing" ? "active" : ""} onClick={() => { setView("Briefing"); setMobileNav(false); }}><Layers3 size={18}/> Briefing</button>
          <button className={view === "Discover" ? "active" : ""} onClick={() => { setView("Discover"); setMobileNav(false); }}><Compass size={18}/> Discover</button>
          <button className={view === "Saved" ? "active" : ""} onClick={() => { setView("Saved"); setMobileNav(false); }}><Bookmark size={18}/> Saved <b>{saved.length}</b></button>
          <button className={view === "Learning" ? "active" : ""} onClick={() => { setView("Learning"); setMobileNav(false); }}><Check size={18}/> Learning queue <b>{learning.length}</b></button>
        </nav>
        <div className="sidebar-bottom">
          <div className="profile">
            {clerkConfigured ? (
              <>
                <Show when="signed-in"><UserButton/><span><strong>My workspace</strong><small>Clerk account</small></span></Show>
                <Show when="signed-out"><SignInButton mode="modal"><button className="profile-auth">Sign in</button></SignInButton></Show>
              </>
            ) : (
              <><div>DN</div><span><strong>Daily reader</strong><small>Personal workspace</small></span></>
            )}
          </div>
          <button className="settings" onClick={cycleTheme}><Palette size={17}/> Theme <span>{theme}</span></button>
        </div>
      </aside>

      {mobileNav && <button className="nav-backdrop" onClick={() => setMobileNav(false)} aria-label="Close navigation"/>}

      <main>
        <header>
          <button className="menu-button" onClick={() => setMobileNav(true)} aria-label="Open navigation"><Menu size={20}/></button>
          <div className="search"><Search size={17}/><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search signals, releases, concepts..." /></div>
          <div className="header-actions">
            <button className="theme-button" onClick={cycleTheme} title="Change theme" aria-label="Change theme"><Palette size={16}/></button>
            <button className="refresh" onClick={() => load(true)} disabled={loading}><RefreshCw size={16} className={loading ? "spin" : ""}/><span>{loading ? "Updating" : "Refresh"}</span></button>
          </div>
        </header>

        <div className="content">
          <div className="title-row">
            <div><p className="eyebrow">{dateLabel}</p><h1>{view === "Briefing" ? "Your daily briefing" : view}</h1></div>
            <div className="health"><span/><div><strong>{data?.sourcesHealthy ?? 0}/{data?.sourcesChecked ?? 0}</strong><small>sources healthy</small></div></div>
          </div>

          <div className="topic-row">
            {TOPICS.map((name) => <button key={name} className={topic === name ? "selected" : ""} onClick={() => setTopic(name)}>{name}</button>)}
          </div>

          {view === "Briefing" && <section className="briefing-grid">
            <article className="lead-card">
              {briefing[0] ? <>
                <div className="lead-top"><span className="high-label">TOP SIGNAL</span><span className="score">{briefing[0].score} relevance</span></div>
                <h2>{briefing[0].title}</h2>
                <p>{briefing[0].summary}</p>
                <div className="why"><Sparkles size={16}/><div><strong>Why it matters</strong><p>{briefing[0].whyItMatters}</p></div></div>
                <div className="lead-actions"><a href={briefing[0].url} target="_blank" rel="noreferrer">Read original <ChevronRight size={15}/></a><button onClick={() => toggleSaved(briefing[0].id)}><Bookmark size={15} fill={saved.includes(briefing[0].id) ? "currentColor" : "none"}/> {saved.includes(briefing[0].id) ? "Saved" : "Save"}</button></div>
              </> : <div className="empty"><Sparkles/><h2>Preparing your briefing</h2><p>Live sources are being checked.</p></div>}
            </article>

            <div className="briefing-list">
              <div className="section-label"><span>Worth knowing</span><small>{briefing.length - 1} signals</small></div>
              {briefing.slice(1).map((item) => <SignalRow key={item.id} item={item} saved={saved.includes(item.id)} onSave={() => toggleSaved(item.id)} onLearn={() => toggleLearning(item.id)} learned={learning.includes(item.id)} />)}
            </div>
          </section>}

          {(view !== "Briefing") && <section className="feed">
            <div className="section-label"><span>{view === "Discover" ? "All signals" : `${view} signals`}</span><small>{items.length} results</small></div>
            {items.length ? items.map((item) => <SignalRow key={item.id} item={item} saved={saved.includes(item.id)} onSave={() => toggleSaved(item.id)} onLearn={() => toggleLearning(item.id)} learned={learning.includes(item.id)} />) : <div className="empty feed-empty"><Search/><h2>No signals found</h2><p>Try another topic or search term.</p></div>}
          </section>}

          {view === "Briefing" && items.length > 5 && <section className="feed compact-feed"><div className="section-label"><span>More to watch</span><small>{items.length - 5} signals</small></div>{items.slice(5, 11).map((item) => <SignalRow key={item.id} item={item} saved={saved.includes(item.id)} onSave={() => toggleSaved(item.id)} onLearn={() => toggleLearning(item.id)} learned={learning.includes(item.id)} />)}</section>}
        </div>
      </main>
    </div>
  );
}

function SignalRow({ item, saved, learned, onSave, onLearn }: { item: TechItem; saved: boolean; learned: boolean; onSave: () => void; onLearn: () => void }) {
  return (
    <article className="signal-row">
      <div className={`signal-icon ${item.importance.toLowerCase()}`}><Sparkles size={16}/></div>
      <div className="signal-body">
        <div className="signal-meta"><span>{item.source}</span><i/><span><Clock3 size={12}/>{relativeTime(item.publishedAt)}</span>{item.importance === "High" && <b>HIGH</b>}</div>
        <h3><a href={item.url} target="_blank" rel="noreferrer">{item.title}</a></h3>
        <p>{item.summary}</p>
        <div className="topic-pills">{item.topics.map((name) => <span key={name}>{name}</span>)}</div>
      </div>
      <div className="row-actions"><button title={saved ? "Remove saved item" : "Save item"} onClick={onSave}><Bookmark size={16} fill={saved ? "currentColor" : "none"}/></button><button title={learned ? "Remove from learning queue" : "Add to learning queue"} className={learned ? "learned" : ""} onClick={onLearn}><Check size={16}/></button></div>
    </article>
  );
}
