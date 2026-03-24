/* ========================================
   Open Source Dashboard — App Logic
   ======================================== */

// Language colors (GitHub-style)
const LANG_COLORS = {
  'Python': '#3572A5',
  'TypeScript': '#3178c6',
  'JavaScript': '#f1e05a',
  'Rust': '#dea584',
  'Go': '#00ADD8',
  'C++': '#f34b7d',
  'Java': '#b07219',
  'Jupyter Notebook': '#DA5B0B',
  'HTML': '#e34c26',
  'CSS': '#563d7c',
  'Shell': '#89e051',
  'Dart': '#00B4AB',
  'Ruby': '#701516',
  'Swift': '#F05138',
  'Kotlin': '#A97BFF',
  'C#': '#178600',
  'PHP': '#4F5D95',
  'Scala': '#c22d40',
  'Lua': '#000080',
  'Zig': '#ec915c',
};

// Issue source repos with nice names
const ISSUE_SOURCES = [
  { key: 'langchain', label: 'LangChain', file: 'issues-langchain.json' },
  { key: 'ollama', label: 'Ollama', file: 'issues-ollama.json' },
  { key: 'n8n', label: 'n8n', file: 'issues-n8n.json' },
  { key: 'huggingface', label: 'Hugging Face', file: 'issues-huggingface.json' },
  { key: 'openwebui', label: 'Open WebUI', file: 'issues-openwebui.json' },
  { key: 'autogpt', label: 'AutoGPT', file: 'issues-autogpt.json' },
];

// Learning roadmap data
const ROADMAP = [
  {
    level: 'beginner',
    title: '🌱 Start Here — Learn the Tools',
    desc: 'Get comfortable with the tools that power AI automation. Great for documentation fixes, bug reports, and simple improvements.',
    repos: [
      { name: 'ollama/ollama', desc: 'Run LLMs locally — easy to understand & test', url: 'https://github.com/ollama/ollama' },
      { name: 'n8n-io/n8n', desc: 'Visual workflow automation — great for non-coders', url: 'https://github.com/n8n-io/n8n' },
      { name: 'open-webui/open-webui', desc: 'Chat UI for LLMs — lots of UI issues to help with', url: 'https://github.com/open-webui/open-webui' },
    ]
  },
  {
    level: 'beginner',
    title: '📝 Documentation & Community',
    desc: 'Contributing docs, tutorials, and examples is the easiest way to start. Every project needs better docs!',
    repos: [
      { name: 'langchain-ai/langchain', desc: 'Fix typos, add examples, improve tutorials', url: 'https://github.com/langchain-ai/langchain' },
      { name: 'huggingface/transformers', desc: 'Massive community, very welcoming to beginners', url: 'https://github.com/huggingface/transformers' },
      { name: 'microsoft/autogen', desc: 'Multi-agent AI framework, growing fast', url: 'https://github.com/microsoft/autogen' },
    ]
  },
  {
    level: 'intermediate',
    title: '⚡ Build & Extend — Automation Workflows',
    desc: 'Create custom nodes, integrations, and workflow templates. Combines business logic with code.',
    repos: [
      { name: 'n8n-io/n8n', desc: 'Build custom nodes and workflow templates', url: 'https://github.com/n8n-io/n8n' },
      { name: 'activepieces/activepieces', desc: 'Open source Zapier alternative', url: 'https://github.com/activepieces/activepieces' },
      { name: 'windmill-labs/windmill', desc: 'Developer platform for scripts & workflows', url: 'https://github.com/windmill-labs/windmill' },
    ]
  },
  {
    level: 'intermediate',
    title: '🤖 AI Agent Frameworks',
    desc: 'Understand how AI agents work by contributing to the frameworks that power them.',
    repos: [
      { name: 'Significant-Gravitas/AutoGPT', desc: 'Autonomous AI agent platform', url: 'https://github.com/Significant-Gravitas/AutoGPT' },
      { name: 'crewai/crewai', desc: 'Multi-agent orchestration framework', url: 'https://github.com/crewAIInc/crewAI' },
      { name: 'langgenius/dify', desc: 'LLM app development platform', url: 'https://github.com/langgenius/dify' },
    ]
  },
  {
    level: 'advanced',
    title: '🧠 LLM Infrastructure & Models',
    desc: 'Deep dive into model serving, fine-tuning, and AI infrastructure.',
    repos: [
      { name: 'vllm-project/vllm', desc: 'High-throughput LLM serving engine', url: 'https://github.com/vllm-project/vllm' },
      { name: 'ggml-org/llama.cpp', desc: 'LLM inference in C/C++', url: 'https://github.com/ggerganov/llama.cpp' },
      { name: 'huggingface/trl', desc: 'Transformer reinforcement learning', url: 'https://github.com/huggingface/trl' },
    ]
  },
  {
    level: 'advanced',
    title: '🔬 RAG & Knowledge Systems',
    desc: 'Build retrieval-augmented generation systems and knowledge bases.',
    repos: [
      { name: 'chroma-core/chroma', desc: 'AI-native embedding database', url: 'https://github.com/chroma-core/chroma' },
      { name: 'run-llama/llama_index', desc: 'Data framework for LLM apps', url: 'https://github.com/run-llama/llama_index' },
      { name: 'qdrant/qdrant', desc: 'Vector similarity search engine', url: 'https://github.com/qdrant/qdrant' },
    ]
  },
];

// Builder's Toolkit data
const BUILDER_TOOLS = [
  // AI App Builders
  { name: 'Lovable', category: 'AI App Builders', desc: 'Full-stack app builder — describe what you want and it codes it for you. Ships real apps.', url: 'https://lovable.dev', pricing: 'Free tier', icon: '💜', hot: true },
  { name: 'Bolt.new', category: 'AI App Builders', desc: 'AI web dev in the browser. Generates, edits, and deploys full-stack apps from prompts.', url: 'https://bolt.new', pricing: 'Free tier', icon: '⚡', hot: true },
  { name: 'v0 by Vercel', category: 'AI App Builders', desc: 'Generate React UI components from text or images. Copy-paste into your Next.js project.', url: 'https://v0.dev', pricing: 'Free tier', icon: '▲', hot: true },
  { name: 'Replit', category: 'AI App Builders', desc: 'Cloud IDE with AI assistant. Write, run, and deploy code in 50+ languages from your browser.', url: 'https://replit.com', pricing: 'Free tier', icon: '🔁' },
  { name: 'Create.xyz', category: 'AI App Builders', desc: 'Build web apps, tools, and forms by describing them. No code, instant deploy.', url: 'https://create.xyz', pricing: 'Free tier', icon: '🎯' },
  { name: 'Windsurf', category: 'AI App Builders', desc: 'AI-powered IDE that writes, refactors, and explains code. Built on top of VS Code.', url: 'https://codeium.com/windsurf', pricing: 'Free tier', icon: '🏄' },

  // Design & Front-end
  { name: 'Framer', category: 'Design & Frontend', desc: 'Design and publish stunning websites visually. No code, real React output.', url: 'https://framer.com', pricing: 'Free tier', icon: '🎨' },
  { name: 'Webflow', category: 'Design & Frontend', desc: 'Professional visual web design tool. Full CMS and hosting included.', url: 'https://webflow.com', pricing: 'Free tier', icon: '🌊' },
  { name: 'Figma', category: 'Design & Frontend', desc: 'Collaborative interface design. The industry standard for UI/UX with AI plugins.', url: 'https://figma.com', pricing: 'Free tier', icon: '🖌️' },

  // Automation
  { name: 'n8n', category: 'Automation', desc: 'Open source workflow automation. Connect anything to everything with a visual builder.', url: 'https://n8n.io', pricing: 'Free / Self-host', icon: '🔗', hot: true },
  { name: 'Make (Integromat)', category: 'Automation', desc: 'Visual automation platform. Build complex workflows with drag-and-drop.', url: 'https://make.com', pricing: 'Free tier', icon: '⚙️' },
  { name: 'Zapier', category: 'Automation', desc: 'Connect 6000+ apps with simple if-this-then-that automations. No code needed.', url: 'https://zapier.com', pricing: 'Free tier', icon: '⚡' },

  // Backend & Data
  { name: 'Supabase', category: 'Backend & Data', desc: 'Open source Firebase alternative. Instant Postgres, auth, storage, and real-time.', url: 'https://supabase.com', pricing: 'Free tier', icon: '🟩' },
  { name: 'Firebase', category: 'Backend & Data', desc: 'Google\'s app platform. Auth, database, hosting, and ML — all plug-and-play.', url: 'https://firebase.google.com', pricing: 'Free tier', icon: '🔥' },
  { name: 'Airtable', category: 'Backend & Data', desc: 'Spreadsheet meets database. Build apps and workflows on top of your data.', url: 'https://airtable.com', pricing: 'Free tier', icon: '📊' },

  // AI Coding Assistants
  { name: 'Cursor', category: 'AI Coding Assistants', desc: 'The AI-first code editor. Understands your entire codebase, writes & refactors code.', url: 'https://cursor.com', pricing: 'Free tier', icon: '🔮', hot: true },
  { name: 'GitHub Copilot', category: 'AI Coding Assistants', desc: 'AI pair programmer by GitHub. Auto-completes code and answers questions in your editor.', url: 'https://github.com/features/copilot', pricing: 'Free for students', icon: '🤖' },
  { name: 'Claude (Anthropic)', category: 'AI Coding Assistants', desc: 'Advanced AI assistant for coding, writing, and analysis. Great for learning concepts.', url: 'https://claude.ai', pricing: 'Free tier', icon: '🧠' },
];


// --- Utility ---
function formatDate(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now - d;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'today';
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}

function formatNumber(n) {
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
  return n.toString();
}

function getLangColor(lang) {
  return LANG_COLORS[lang] || '#888';
}

async function loadJSON(path) {
  try {
    const res = await fetch(path);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (e) {
    console.warn(`Could not load ${path}:`, e.message);
    return null;
  }
}


// --- Render Functions ---

function renderProfile(data) {
  const section = document.getElementById('profile-section');
  section.innerHTML = `
    <img src="${data.avatar_url}" alt="Avatar" class="profile__avatar">
    <div>
      <div class="profile__name">${data.name || data.login}</div>
      <div class="profile__username">
        <a href="${data.html_url}" target="_blank">@${data.login}</a>
        ${data.bio ? ` · ${data.bio}` : ''}
      </div>
      <div class="profile__stats">
        <div class="stat">
          <span class="stat__value">${data.public_repos}</span>
          <span class="stat__label">Repos</span>
        </div>
        <div class="stat">
          <span class="stat__value">${data.followers}</span>
          <span class="stat__label">Followers</span>
        </div>
        <div class="stat">
          <span class="stat__value">${data.following}</span>
          <span class="stat__label">Following</span>
        </div>
        <div class="stat">
          <span class="stat__value">${formatDate(data.created_at)}</span>
          <span class="stat__label">Joined</span>
        </div>
      </div>
    </div>
  `;
}

function renderYourRepos(repos) {
  const grid = document.getElementById('your-repos-grid');
  const count = document.getElementById('your-repos-count');
  const publicRepos = repos.filter(r => !r.isPrivate);
  count.textContent = `${publicRepos.length} public`;

  if (publicRepos.length === 0) {
    grid.innerHTML = '<div class="empty-state">No public repos yet. Time to create one! 🚀</div>';
    return;
  }

  grid.innerHTML = publicRepos.map((repo, i) => `
    <a href="${repo.url}" target="_blank" class="your-repo animate-in">
      <div class="your-repo__name">📁 ${repo.name}</div>
      ${repo.description ? `<div class="your-repo__desc">${repo.description}</div>` : ''}
      <div class="your-repo__meta">
        ${repo.primaryLanguage ? `<span>${repo.primaryLanguage.name}</span>` : ''}
        <span>⭐ ${repo.stargazerCount}</span>
        <span>Updated ${formatDate(repo.updatedAt)}</span>
      </div>
    </a>
  `).join('');
}

function renderTrending(data) {
  const grid = document.getElementById('trending-grid');
  const count = document.getElementById('trending-count');

  if (!data || !data.items || data.items.length === 0) {
    grid.innerHTML = '<div class="empty-state">No trending repos found. Try refreshing data.</div>';
    return;
  }

  count.textContent = `${data.items.length} repos`;

  grid.innerHTML = data.items.slice(0, 12).map((repo, i) => {
    const lang = repo.language || 'Unknown';
    const topics = (repo.topics || []).slice(0, 4);
    return `
      <a href="${repo.html_url}" target="_blank" class="repo-card animate-in">
        <div class="repo-card__header">
          <span class="repo-card__name">${repo.name}</span>
        </div>
        <div class="repo-card__owner">${repo.full_name}</div>
        <div class="repo-card__desc">${repo.description || 'No description'}</div>
        <div class="repo-card__footer">
          <span class="repo-card__lang">
            <span class="repo-card__lang-dot" style="background:${getLangColor(lang)}"></span>
            ${lang}
          </span>
          <span class="repo-card__stars">⭐ ${formatNumber(repo.stargazers_count)}</span>
          <span class="repo-card__forks">🔀 ${formatNumber(repo.forks_count)}</span>
        </div>
        ${topics.length > 0 ? `
          <div class="repo-card__topics">
            ${topics.map(t => `<span class="topic-tag">${t}</span>`).join('')}
          </div>
        ` : ''}
      </a>
    `;
  }).join('');
}

function renderIssues(allIssues, activeFilter = 'all') {
  const list = document.getElementById('issues-list');
  const count = document.getElementById('issues-count');
  const filtersEl = document.getElementById('issue-filters');

  // Build filter tabs
  const availableSources = ISSUE_SOURCES.filter(s => allIssues[s.key] && allIssues[s.key].length > 0);
  const totalCount = availableSources.reduce((sum, s) => sum + allIssues[s.key].length, 0);

  filtersEl.innerHTML = `
    <button class="filter-tab ${activeFilter === 'all' ? 'active' : ''}" data-filter="all">All (${totalCount})</button>
    ${availableSources.map(s => `
      <button class="filter-tab ${activeFilter === s.key ? 'active' : ''}" data-filter="${s.key}">${s.label} (${allIssues[s.key].length})</button>
    `).join('')}
  `;

  // Add click handlers
  filtersEl.querySelectorAll('.filter-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      renderIssues(allIssues, btn.dataset.filter);
    });
  });

  // Filter issues
  let issues = [];
  if (activeFilter === 'all') {
    availableSources.forEach(s => {
      allIssues[s.key].forEach(issue => {
        issues.push({ ...issue, _source: s.label });
      });
    });
  } else {
    const source = ISSUE_SOURCES.find(s => s.key === activeFilter);
    if (source && allIssues[source.key]) {
      issues = allIssues[source.key].map(issue => ({ ...issue, _source: source.label }));
    }
  }

  count.textContent = `${issues.length} issues`;

  if (issues.length === 0) {
    list.innerHTML = '<div class="empty-state">No good first issues found right now. Check back later! 🔍</div>';
    return;
  }

  list.innerHTML = issues.slice(0, 20).map((issue, i) => {
    const repoName = issue.repository_url ? issue.repository_url.split('/').slice(-2).join('/') : issue._source;
    const labels = (issue.labels || []).slice(0, 3);
    return `
      <a href="${issue.html_url}" target="_blank" class="issue-card animate-in">
        <div class="issue-card__icon">🟢</div>
        <div class="issue-card__content">
          <div class="issue-card__title">${issue.title}</div>
          <div class="issue-card__meta">
            <span class="issue-card__repo">${repoName}</span>
            <span>💬 ${issue.comments} comments</span>
            <span>Opened ${formatDate(issue.created_at)}</span>
          </div>
          ${labels.length > 0 ? `
            <div class="issue-card__labels">
              ${labels.map(l => `
                <span class="label-tag" style="background:${l.color ? '#' + l.color + '22' : 'rgba(124,58,237,0.1)'};color:${l.color ? '#' + l.color : 'var(--accent-purple)'};border:1px solid ${l.color ? '#' + l.color + '44' : 'transparent'}">${l.name}</span>
              `).join('')}
            </div>
          ` : ''}
        </div>
      </a>
    `;
  }).join('');
}

function renderRoadmap() {
  const grid = document.getElementById('roadmap-grid');
  grid.innerHTML = ROADMAP.map(item => `
    <div class="roadmap-card animate-in">
      <div class="roadmap-card__level roadmap-card__level--${item.level}">
        ${item.level === 'beginner' ? '🟢' : item.level === 'intermediate' ? '🟡' : '🔴'} ${item.level}
      </div>
      <div class="roadmap-card__title">${item.title}</div>
      <div class="roadmap-card__desc">${item.desc}</div>
      <div class="roadmap-card__repos">
        ${item.repos.map(r => `
          <a href="${r.url}" target="_blank" class="roadmap-card__repo-link">
            <span>→</span>
            <span><strong>${r.name}</strong> — ${r.desc}</span>
          </a>
        `).join('')}
      </div>
    </div>
  `).join('');
}

// Store current toolkit data at module level for filter re-renders
let _currentToolkitData = BUILDER_TOOLS;

function renderToolkit(activeCategory = 'all', toolsData = null) {
  if (toolsData) _currentToolkitData = toolsData;
  const allTools = _currentToolkitData;

  const grid = document.getElementById('toolkit-grid');
  const filtersEl = document.getElementById('toolkit-filters');

  const categories = [...new Set(allTools.map(t => t.category))];

  filtersEl.innerHTML = `
    <button class="filter-tab ${activeCategory === 'all' ? 'active' : ''}" data-cat="all">All (${allTools.length})</button>
    ${categories.map(cat => {
    const count = allTools.filter(t => t.category === cat).length;
    return `<button class="filter-tab ${activeCategory === cat ? 'active' : ''}" data-cat="${cat}">${cat} (${count})</button>`;
  }).join('')}
  `;

  filtersEl.querySelectorAll('.filter-tab').forEach(btn => {
    btn.addEventListener('click', () => renderToolkit(btn.dataset.cat));
  });

  const tools = activeCategory === 'all'
    ? allTools
    : allTools.filter(t => t.category === activeCategory);

  grid.innerHTML = tools.map((tool, i) => `
    <a href="${tool.url}" target="_blank" class="tool-card animate-in" style="animation-delay: ${i * 0.04}s">
      ${tool.hot ? '<span class="tool-card__hot">HOT</span>' : ''}
      <div class="tool-card__icon">${tool.icon || '🔧'}</div>
      <div class="tool-card__name">${tool.name}</div>
      <div class="tool-card__category">${tool.category}</div>
      <div class="tool-card__desc">${tool.desc || tool.description || ''}</div>
      <div class="tool-card__footer">
        <span class="tool-card__pricing">${tool.pricing || 'Free tier'}</span>
        <span class="tool-card__visit">Visit →</span>
      </div>
    </a>
  `).join('');
}


// --- Main ---
async function init() {
  // Initialize Firebase (graceful — works fine without it)
  const hasFirebase = typeof initFirebase === 'function' && initFirebase();

  // Set date if element exists
  const dateEl = document.getElementById('current-date');
  if (dateEl) {
    dateEl.textContent = `Last updated: ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`;
  }

  // Load GitHub data in parallel
  const [profile, repos, trendingAI, trendingAutomation, ...issueData] = await Promise.all([
    loadJSON('data/profile.json'),
    loadJSON('data/repos.json'),
    loadJSON('data/trending-ai.json'),
    loadJSON('data/trending-automation.json'),
    ...ISSUE_SOURCES.map(s => loadJSON(`data/${s.file}`)),
  ]);

  // Render profile
  if (profile) {
    renderProfile(profile);
  } else {
    document.getElementById('profile-section').innerHTML =
      '<div class="empty-state">Could not load profile. Run <code>./fetch-data.sh</code> first!</div>';
  }

  // Render your repos
  if (repos) {
    renderYourRepos(repos);
  } else {
    document.getElementById('your-repos-grid').innerHTML =
      '<div class="empty-state">Could not load repos.</div>';
  }

  // Combine trending results
  if (trendingAI || trendingAutomation) {
    const combined = { items: [] };
    if (trendingAI?.items) combined.items.push(...trendingAI.items);
    if (trendingAutomation?.items) combined.items.push(...trendingAutomation.items);
    const seen = new Set();
    combined.items = combined.items.filter(r => {
      if (seen.has(r.id)) return false;
      seen.add(r.id);
      return true;
    });
    combined.items.sort((a, b) => b.stargazers_count - a.stargazers_count);
    renderTrending(combined);
  } else {
    document.getElementById('trending-grid').innerHTML =
      '<div class="empty-state">Could not load trending repos.</div>';
  }

  // Render issues
  const allIssues = {};
  ISSUE_SOURCES.forEach((source, i) => {
    const data = issueData[i];
    allIssues[source.key] = data?.items || [];
  });
  renderIssues(allIssues);

  // --- Toolkit: try Firebase first, fall back to hardcoded ---
  let toolkitData = null;
  let toolkitSource = 'local';

  if (hasFirebase) {
    toolkitData = await loadToolsFromFirebase();
    if (toolkitData && toolkitData.length > 0) {
      toolkitSource = 'firebase';
    }
  }

  if (!toolkitData || toolkitData.length === 0) {
    toolkitData = BUILDER_TOOLS;
    toolkitSource = 'local';
  }

  // Update the badge to show data source
  const badgeEl = document.querySelector('.section__badge-new');
  if (badgeEl) {
    if (toolkitSource === 'firebase') {
      badgeEl.textContent = 'LIVE · FIREBASE';
      badgeEl.style.background = '#4ade80';
    } else {
      badgeEl.textContent = 'FOR NON-ENGINEERS';
    }
  }

  renderToolkit('all', toolkitData);

  // Render roadmap (static)
  renderRoadmap();

  console.log(`[Vibe Coder] Dashboard ready — toolkit source: ${toolkitSource}`);

  // Expose seed helper to console for easy setup
  if (hasFirebase) {
    window.seedTools = () => seedToolsToFirebase(BUILDER_TOOLS);
    console.log('[Vibe Coder] Firebase connected. To seed tools, run: seedTools()');
  }
}

// Go!
init();

