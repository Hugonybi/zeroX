import { useEffect, useState } from "react";
import { Button } from "./ui/Button";

export function DevAuthBanner() {
  const [token, setToken] = useState<string | null>(null);
  const [showInput, setShowInput] = useState(false);
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    const storedToken = localStorage.getItem("auth_token");
    setToken(storedToken);
  }, []);

  const handleSetToken = () => {
    if (inputValue.trim()) {
      localStorage.setItem("auth_token", inputValue.trim());
      setToken(inputValue.trim());
      setInputValue("");
      setShowInput(false);
      window.location.reload();
    }
  };

  const handleClear = () => {
    localStorage.removeItem("auth_token");
    setToken(null);
    window.location.reload();
  };

  if (import.meta.env.PROD) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-xs shadow-lg">
      <div className="flex items-start gap-3">
        <span className="text-base">🔐</span>
        <div className="flex-1 space-y-2">
          <p className="font-semibold uppercase tracking-[0.2em] text-amber-900">Dev Auth Helper</p>
          {token ? (
            <>
              <p className="text-amber-700">
                Token: <code className="rounded bg-amber-100 px-1">{token.substring(0, 20)}...</code>
              </p>
              <Button variant="ghost" size="sm" onClick={handleClear}>
                Clear Token
              </Button>
            </>
          ) : (
            <>
              <p className="text-amber-700">No auth token set. Run test script to get one.</p>
              {showInput ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Paste JWT token here"
                    className="w-full rounded border border-amber-300 bg-white px-2 py-1 text-xs"
                  />
                  <div className="flex gap-2">
                    <Button variant="primary" size="sm" onClick={handleSetToken}>
                      Set Token
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setShowInput(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <Button variant="secondary" size="sm" onClick={() => setShowInput(true)}>
                  Set Token
                </Button>
              )}
            </>
          )}
          <p className="text-amber-600">
            Run: <code className="rounded bg-amber-100 px-1">node test-artwork-flow.js</code>
          </p>
          <p className="text-xs text-amber-600">
            💡 Azure CORS errors are normal - stub URLs work fine for testing
          </p>
        </div>
      </div>
    </div>
  );
}
