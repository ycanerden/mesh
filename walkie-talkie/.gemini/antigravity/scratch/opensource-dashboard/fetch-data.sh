#!/bin/bash
# Open Source Dashboard — Data Fetcher
# Fetches live data from GitHub using the gh CLI

GH=~/bin/gh
DATA_DIR="$(dirname "$0")/data"
mkdir -p "$DATA_DIR"

echo "🔄 Fetching your GitHub profile..."
$GH api users/ycanerden > "$DATA_DIR/profile.json" 2>/dev/null

echo "📦 Fetching your repositories..."
$GH repo list ycanerden --limit 30 --json name,description,primaryLanguage,stargazerCount,updatedAt,isPrivate,url > "$DATA_DIR/repos.json" 2>/dev/null

echo "🔥 Fetching trending AI/LLM repos..."
$GH api 'search/repositories?q=topic:llm+topic:ai+stars:>500&sort=stars&order=desc&per_page=20' > "$DATA_DIR/trending-ai.json" 2>/dev/null

echo "🤖 Fetching trending automation repos..."
$GH api 'search/repositories?q=topic:automation+topic:workflow+stars:>200&sort=updated&order=desc&per_page=15' > "$DATA_DIR/trending-automation.json" 2>/dev/null

echo "🏷️  Fetching good first issues — LangChain..."
$GH api 'search/issues?q=repo:langchain-ai/langchain+label:"good+first+issue"+state:open&sort=created&order=desc&per_page=10' > "$DATA_DIR/issues-langchain.json" 2>/dev/null

echo "🏷️  Fetching good first issues — Ollama..."
$GH api 'search/issues?q=repo:ollama/ollama+label:"good+first+issue"+state:open&sort=created&order=desc&per_page=10' > "$DATA_DIR/issues-ollama.json" 2>/dev/null

echo "🏷️  Fetching good first issues — n8n..."
$GH api 'search/issues?q=repo:n8n-io/n8n+label:"good+first+issue"+state:open&sort=created&order=desc&per_page=10' > "$DATA_DIR/issues-n8n.json" 2>/dev/null

echo "🏷️  Fetching good first issues — Hugging Face Transformers..."
$GH api 'search/issues?q=repo:huggingface/transformers+label:"good+first+issue"+state:open&sort=created&order=desc&per_page=10' > "$DATA_DIR/issues-huggingface.json" 2>/dev/null

echo "🏷️  Fetching good first issues — Open WebUI..."
$GH api 'search/issues?q=repo:open-webui/open-webui+label:"good+first+issue"+state:open&sort=created&order=desc&per_page=10' > "$DATA_DIR/issues-openwebui.json" 2>/dev/null

echo "🏷️  Fetching good first issues — AutoGPT..."
$GH api 'search/issues?q=repo:Significant-Gravitas/AutoGPT+label:"good+first+issue"+state:open&sort=created&order=desc&per_page=10' > "$DATA_DIR/issues-autogpt.json" 2>/dev/null

echo ""
echo "✅ All data fetched! Files saved in $DATA_DIR/"
echo "📊 Ready to view your dashboard."
