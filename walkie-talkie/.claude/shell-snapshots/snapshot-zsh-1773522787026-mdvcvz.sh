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
if ! (unalias rg 2>/dev/null; command -v rg) >/dev/null 2>&1; then
  function rg {
  if [[ -n $ZSH_VERSION ]]; then
    ARGV0=rg '/Users/canerden/Library/Application Support/Claude/claude-code/2.1.72/claude' "$@"
  elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]] || [[ "$OSTYPE" == "win32" ]]; then
    ARGV0=rg '/Users/canerden/Library/Application Support/Claude/claude-code/2.1.72/claude' "$@"
  elif [[ $BASHPID != $$ ]]; then
    exec -a rg '/Users/canerden/Library/Application Support/Claude/claude-code/2.1.72/claude' "$@"
  else
    (exec -a rg '/Users/canerden/Library/Application Support/Claude/claude-code/2.1.72/claude' "$@")
  fi
}
fi
export PATH=/Users/canerden/.antigravity/antigravity/bin\:/Library/Frameworks/Python.framework/Versions/3.11.5/bin\:/Library/Frameworks/Python.framework/Versions/3.x/bin\:/opt/homebrew/bin\:/opt/homebrew/sbin\:/Library/Frameworks/Python.framework/Versions/3.13/bin\:/Library/Frameworks/Python.framework/Versions/3.11/bin\:/usr/local/bin\:/System/Cryptexes/App/usr/bin\:/usr/bin\:/bin\:/usr/sbin\:/sbin\:/var/run/com.apple.security.cryptexd/codex.system/bootstrap/usr/local/bin\:/var/run/com.apple.security.cryptexd/codex.system/bootstrap/usr/bin\:/var/run/com.apple.security.cryptexd/codex.system/bootstrap/usr/appleinternal/bin\:/opt/pmk/env/global/bin\:/Library/Apple/usr/bin\:/Users/canerden/.lmstudio/bin
