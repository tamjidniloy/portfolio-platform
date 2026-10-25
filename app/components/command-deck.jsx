import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";

const COMMON_DESTINATIONS = [
  { href: "/#work", title: "Selected work", category: "Navigation" },
  { href: "/brief", title: "Professional quick view", category: "Navigation" },
  { href: "/#about", title: "About", category: "Navigation" },
  { href: "/#expertise", title: "Expertise", category: "Navigation" },
  { href: "/#journey", title: "Experience", category: "Navigation" },
  { href: "/#contact", title: "Contact", category: "Navigation" },
  { href: "/privacy", title: "Privacy", category: "Navigation" },
];

export function CommandDeck({ projects = [] }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const inputRef = useRef(null);
  const launchRef = useRef(null);
  const navigate = useNavigate();

  const entries = useMemo(() => [
    ...COMMON_DESTINATIONS,
    ...projects.map((project) => ({
      href: "/projects/" + encodeURIComponent(project.id),
      title: project.title,
      category: project.category || "Project",
      keywords: [project.description, project.stack, project.year].filter(Boolean).join(" "),
    })),
  ], [projects]);

  const results = useMemo(() => {
    const term = query.trim().toLocaleLowerCase();
    if (!term) return entries.slice(0, 9);
    return entries.filter((entry) => [entry.title, entry.category, entry.keywords || ""]
      .join(" ").toLocaleLowerCase().includes(term)).slice(0, 9);
  }, [entries, query]);

  useEffect(() => {
    function shortcuts(event) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((before) => !before);
      } else if (event.key === "Escape") {
        setOpen(false);
      }
    }
    window.addEventListener("keydown", shortcuts);
    return () => window.removeEventListener("keydown", shortcuts);
  }, []);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
    } else {
      setQuery("");
      setSelected(0);
    }
  }, [open]);

  function dismiss() {
    setOpen(false);
    launchRef.current?.focus();
  }

  function onKeyDown(event) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setSelected((index) => (index + 1) % Math.max(results.length, 1));
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setSelected((index) => (index - 1 + Math.max(results.length, 1)) % Math.max(results.length, 1));
    }
    if (event.key === "Enter" && results.length && event.target === inputRef.current) {
      event.preventDefault();
      const destination = results[Math.min(selected, results.length - 1)].href;
      setOpen(false);
      navigate(destination);
    }
    if (event.key === "Tab") {
      const dialog = event.currentTarget;
      const focusables = [...dialog.querySelectorAll('button:not([disabled]),input:not([disabled]),a[href]')];
      if (!focusables.length) return;
      const first = focusables[0], last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault(); last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault(); first.focus();
      }
    }
  }

  return <>
    <button type="button" className="sig-command-trigger" ref={launchRef}
      aria-label="Open command deck" aria-haspopup="dialog"
      aria-keyshortcuts="Control+K Meta+K" onClick={() => setOpen(true)}>
      <span aria-hidden="true">⌘</span> Explore <kbd>⌘ K</kbd>
    </button>
    {open && <div className="sig-command-layer">
      <button type="button" tabIndex={-1} className="sig-command-backdrop" aria-label="Close command deck" onClick={dismiss}/>
      <section role="dialog" aria-modal="true" aria-labelledby="sig-command-title"
        className="sig-command-dialog" onKeyDown={onKeyDown}>
        <div className="sig-command-head">
          <div>
            <p className="sig-eyebrow">DEVFOLIO OS / QUICK ACCESS</p>
            <h2 id="sig-command-title">Where to?</h2>
          </div>
          <button type="button" className="sig-command-close" onClick={dismiss} aria-label="Close command deck">✕</button>
        </div>
        <label htmlFor="sig-command-search" className="sig-command-label">Search pages and projects</label>
        <input id="sig-command-search" ref={inputRef} type="search" autoComplete="off" role="combobox"
          aria-expanded="true" aria-autocomplete="list" aria-controls="sig-command-results"
          aria-activedescendant={results.length ? "sig-command-option-" + Math.min(selected, results.length - 1) : undefined}
          value={query} onChange={(event) => { setQuery(event.target.value); setSelected(0); }}
          placeholder="Search projects, skills and sections…"/>
        <div id="sig-command-results" role="listbox" aria-label="Search results" className="sig-command-results">
          {results.length === 0 ? <p className="sig-command-empty">No matches. Try a different keyword.</p> :
            results.map((item, index) => <Link
              to={item.href} key={item.href} id={"sig-command-option-" + index}
              role="option" aria-selected={selected === index}
              className={"sig-command-result" + (selected === index ? " is-selected" : "")}
              onMouseEnter={() => setSelected(index)} onClick={() => setOpen(false)}>
              <span>{item.title}<small>{item.category}</small></span>
              <span aria-hidden="true">↗</span>
            </Link>)}
        </div>
        <p className="sig-command-footer"><kbd>↑</kbd><kbd>↓</kbd> to navigate <kbd>↵</kbd> to open <kbd>ESC</kbd> to close</p>
      </section>
    </div>}
  </>;
}
