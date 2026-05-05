export const stats = [
  { label: 'total relics', value: 1284 },
  { label: 'active auctions', value: 219 },
  { label: 'revived projects', value: 472 },
  { label: 'salvage rate %', value: 63 },
];

export const relics = [
  { id: 1, title: 'neural-task-orchestrator', stack: ['React', 'Node', 'Redis'], status: 'auctioning', commits: 132, pitches: 14 },
  { id: 2, title: 'ops-alert-pulse', stack: ['Go', 'gRPC', 'Prometheus'], status: 'orphaned', commits: 78, pitches: 5 },
  { id: 3, title: 'artemis-markdown-suite', stack: ['Next.js', 'Prisma', 'Postgres'], status: 'salvaged', commits: 201, pitches: 23 },
  { id: 4, title: 'stream-ledger-x', stack: ['Rust', 'Kafka', 'ClickHouse'], status: 'revived', commits: 354, pitches: 31 },
  { id: 5, title: 'zero-bug-board', stack: ['Vue', 'Firebase', 'Tailwind'], status: 'auctioning', commits: 48, pitches: 9 },
  { id: 6, title: 'infra-cortex', stack: ['Python', 'FastAPI', 'Docker'], status: 'orphaned', commits: 176, pitches: 12 },
];

export const logs = [
  'user123 dropped project "ai-bot"',
  'relic claimed by devX',
  'scan complete for "legacy-erp-core"',
  'pitch submitted by root_alpha',
  'revival funded: "quant-dashboard"',
  'new auction started for "mailchain"',
];

export const commits = [
  'fix: resolve deadlock in queue scheduler',
  'refactor: flatten parser module before sunset',
  'chore: last release candidate cut',
];

export const pitches = [
  { user: 'sh1ft', rep: 1420, summary: 'Modularize auth and cut infra cost by 40% in 2 sprints.' },
  { user: 'coldstack', rep: 980, summary: 'Port to Bun runtime and add typed plugin API for integrations.' },
  { user: 'zer0day', rep: 1675, summary: 'Stabilize CI/CD, rewrite flaky tests, ship roadmap in 30 days.' },
  { user: 'root_alpha', rep: 1860, summary: 'Ship account recovery, upgrade auth flow, and remove state drift.' },
  { user: 'ghostpatch', rep: 1315, summary: 'Refactor the rescue pipeline and make the UI feel like a terminal.' },
  { user: 'stackforge', rep: 1095, summary: 'Recover abandoned monorepos and add observability across the stack.' },
  { user: 'nullwave', rep: 890, summary: 'Replace brittle routes with guard rails and add backend account state.' },
];
