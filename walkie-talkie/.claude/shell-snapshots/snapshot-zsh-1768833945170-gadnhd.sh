# Snapshot file
# Unset all aliases to avoid conflicts with functions
unalias -a 2>/dev/null || true
# Functions
# Shell Options
setopt nohashdirs
setopt login
# Aliases
alias -- run-help=man
alias -- which-command=whence
# Check for rg availability
if ! command -v rg >/dev/null 2>&1; then
  alias rg='/usr/local/lib/node_modules/\@anthropic-ai/claude-code/vendor/ripgrep/arm64-darwin/rg'
fi
export PATH=/Users/canerden/.antigravity/antigravity/bin\:/Library/Frameworks/Python.framework/Versions/3.11.5/bin\:/Library/Frameworks/Python.framework/Versions/3.x/bin\:/Library/Frameworks/Python.framework/Versions/3.13/bin\:/Library/Frameworks/Python.framework/Versions/3.11/bin\:/usr/local/bin\:/System/Cryptexes/App/usr/bin\:/usr/bin\:/bin\:/usr/sbin\:/sbin\:/var/run/com.apple.security.cryptexd/codex.system/bootstrap/usr/local/bin\:/var/run/com.apple.security.cryptexd/codex.system/bootstrap/usr/bin\:/var/run/com.apple.security.cryptexd/codex.system/bootstrap/usr/appleinternal/bin\:/Library/Apple/usr/bin\:/Users/canerden/.antigravity/antigravity/bin\:/Library/Frameworks/Python.framework/Versions/3.11.5/bin\:/Library/Frameworks/Python.framework/Versions/3.x/bin\:/Library/Frameworks/Python.framework/Versions/3.13/bin\:/Library/Frameworks/Python.framework/Versions/3.11/bin\:/Users/canerden/.lmstudio/bin\:/Users/canerden/.lmstudio/bin
