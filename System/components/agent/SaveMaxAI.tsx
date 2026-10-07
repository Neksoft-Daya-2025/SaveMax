'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Bot, MessageSquare, Plug, Workflow, ShieldCheck, Send, ArrowUpRight, RotateCcw } from 'lucide-react';

const sections = [
  { name: 'Conversation', icon: MessageSquare },
  { name: 'Connections', icon: Plug },
  { name: 'Workflows', icon: Workflow },
  { name: 'Candidates', icon: ShieldCheck },
] as const;
type Section = typeof sections[number]['name'];
type Message = { role: 'assistant' | 'user'; text: string };
const welcome: Message = { role: 'assistant', text: 'Welcome to SaveMax AI. This is your conversation workspace. The server services are installed, but the AI connection and research workflows are not connected yet. You can try the interface below; messages stay in this page and no searches or property changes are performed.' };
const connections = [
  ['OpenClaw', 'Agent runtime installed', 'Connect Codex authentication and the conversation gateway.'],
  ['Codex / AI model', 'Credentials pending', 'Provider credentials will be configured securely on the server. Do not paste keys into chat.'],
  ['n8n', 'Workflow service installed', 'Owner setup and SaveMax business workflows are pending.'],
  ['Firecrawl', 'Research service installed', 'Scrape check passed. Approved sources and agent tool integration are pending.'],
  ['Chromium', 'Browser service installed', 'Browser research integration is pending; one research job at a time.'],
  ['PostgreSQL', 'AI database installed', 'Approvals use persistent storage. Conversation and research history integration are pending.'],
  ['SaveMax Agent API', 'Approval and draft API available', 'Agent tool connection is pending. Drafts require your approval; publishing stays disabled.'],
  ['Research sources', 'Sources pending', 'Add owner-approved websites, feeds or APIs before enabling research.'],
];
const workflows = [
  ['Property Hunter', 'Conversation → approved source research → shortlist → human review → non-public draft'],
  ['Lead Hunter', 'Lead discovery → qualification → human review. Outreach is not enabled.'],
  ['Scheduled research', 'Saved search → scheduled run → results and review. No recurring search is active.'],
  ['Publication', 'Separate human publication approval. Automatic publication is disabled.'],
];

export default function SaveMaxAI({ organizationName, isSuperAdmin }: { organizationName: string; isSuperAdmin: boolean }) {
  const [section, setSection] = useState<Section>('Conversation');
  const [messages, setMessages] = useState<Message[]>([welcome]);
  const [input, setInput] = useState('');
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => { if (messages.length > 1) end.current?.scrollIntoView({ block: 'nearest' }); }, [messages]);
  const approvalHref = isSuperAdmin ? '/superadmin/ai-approvals' : '/ai-approvals';
  function submit(event: React.FormEvent) {
    event.preventDefault();
    const text = input.trim();
    if (!text) return;
    setMessages(previous => [...previous, { role: 'user', text }, { role: 'assistant', text: 'Your message is shown in this interface preview. OpenClaw is not connected to this chat yet, so I have not interpreted it, searched any sources, or created candidates. Once the model and tools are connected, this is where you will receive replies and refine your instructions.' }]);
    setInput('');
  }
  return <div className="mx-auto max-w-7xl space-y-6">
    <header className="flex flex-wrap items-start justify-between gap-4">
      <div><p className="mb-2 text-sm font-medium text-slate-500">{organizationName} · AI workspace</p><h1 className="text-3xl font-bold tracking-tight text-slate-900">SaveMax AI</h1><p className="mt-2 text-sm text-slate-600">Give instructions, explore opportunities, and review the next step.</p></div>
      <Link href={approvalHref} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800">Review candidates <ArrowUpRight size={16} /></Link>
    </header>
    <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950"><strong>Interface preview.</strong> AI credentials and workflow connections are pending. Replies below are fixed setup messages. Nothing is searched, submitted, or published.</div>
    <nav aria-label="AI workspace sections" className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
      {sections.map(({ name, icon: Icon }) => <button key={name} type="button" aria-current={section === name ? 'page' : undefined} onClick={() => setSection(name)} className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium ${section === name ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'}`}><Icon size={17} />{name}</button>)}
    </nav>
    {section === 'Conversation' && <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_280px]">
      <section aria-label="Conversation preview" className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4"><div className="flex items-center gap-2 font-semibold text-slate-900"><Bot size={20} />Your conversation</div><button type="button" onClick={() => { setMessages([welcome]); setInput(''); }} className="inline-flex items-center gap-1.5 text-sm text-slate-600"><RotateCcw size={14} />Reset preview</button></div>
        <div role="log" aria-label="Messages" aria-live="polite" className="h-[420px] overflow-y-auto p-5 sm:p-7">
          {messages.map((message, index) => <div key={index} className={`mb-6 flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[90%] rounded-xl px-4 py-3 sm:max-w-[80%] ${message.role === 'user' ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-800'}`}><p className={`mb-1 text-xs font-semibold ${message.role === 'user' ? 'text-slate-300' : 'text-slate-500'}`}>{message.role === 'user' ? 'You' : 'SaveMax AI · Preview'}</p><p className="whitespace-pre-wrap break-words text-sm leading-6">{message.text}</p></div></div>)}<div ref={end} />
        </div>
        <form onSubmit={submit} className="border-t border-slate-200 p-4"><label htmlFor="savemax-message" className="sr-only">Message SaveMax AI</label><textarea id="savemax-message" value={input} maxLength={4000} onChange={event => setInput(event.target.value)} placeholder="Tell SaveMax AI what you want to do…" rows={3} className="w-full resize-y rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500" /><div className="mt-3 flex flex-wrap items-center justify-between gap-2"><p className="text-xs text-slate-500">Preview only · Not saved after leaving this page · No secrets</p><button disabled={!input.trim()} className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-40"><Send size={15} />Send preview</button></div></form>
      </section>
      <aside className="space-y-5"><div className="rounded-xl border border-slate-200 bg-white p-5"><h2 className="font-semibold text-slate-900">Try an instruction</h2><p className="mt-2 text-sm leading-6 text-slate-500">Examples fill the message box. They are not predefined searches.</p><div className="mt-4 space-y-2">{['Find apartments in Amsterdam under €600,000.', 'Show rental homes in Utrecht with two bedrooms.', 'Explain why these candidates suit my requirements.'].map(example => <button key={example} type="button" onClick={() => setInput(example)} className="w-full rounded-lg border border-slate-200 p-3 text-left text-sm leading-5 text-slate-700 hover:bg-slate-50">{example}</button>)}</div></div><div className="rounded-xl border border-slate-200 bg-white p-5"><ShieldCheck size={22} className="text-blue-700" /><h2 className="mt-3 font-semibold text-slate-900">You stay in control</h2><p className="mt-2 text-sm leading-6 text-slate-600">Candidates need your approval before becoming drafts. Publishing requires a separate approval.</p><button type="button" onClick={() => setSection('Connections')} className="mt-4 text-sm font-semibold text-blue-700">View setup placeholders →</button></div></aside>
    </div>}
    {section === 'Connections' && <section aria-label="Connections" className="grid gap-4 md:grid-cols-2">{connections.map(([name, state, detail]) => <article key={name} className="rounded-xl border border-slate-200 bg-white p-5"><div className="flex items-start justify-between gap-3"><h2 className="font-semibold text-slate-900">{name}</h2><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">Setup pending</span></div><p className="mt-3 text-sm font-medium text-slate-800">{state}</p><p className="mt-2 text-sm leading-6 text-slate-600">{detail}</p><p className="mt-4 text-xs text-slate-500">Configuration placeholder · Live service monitoring is not connected</p></article>)}</section>}
    {section === 'Workflows' && <section aria-label="Workflow placeholders" className="space-y-4">{workflows.map(([name, detail]) => <article key={name} className="rounded-xl border border-slate-200 bg-white p-5"><div className="flex flex-wrap justify-between gap-3"><h2 className="font-semibold text-slate-900">{name}</h2><span className="text-xs font-medium text-slate-500">Not active</span></div><p className="mt-3 text-sm leading-6 text-slate-600">{detail}</p></article>)}</section>}
    {section === 'Candidates' && <section className="rounded-xl border border-slate-200 bg-white p-8"><ShieldCheck size={30} className="text-slate-500" /><h2 className="mt-4 text-xl font-semibold text-slate-900">Your research shortlist</h2><p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">Candidate cards, source links, matching explanations, and research history will appear here once Property Hunter is connected. This preview does not load or fabricate candidates.</p><Link href={approvalHref} className="mt-6 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white">Open existing approval queue <ArrowUpRight size={16} /></Link></section>}
  </div>;
}
