const fs = require('fs');

let content = fs.readFileSync('app/(landing)/page.tsx', 'utf8');

// Replace dark classes with dual classes
const replacements = [
  // Backgrounds
  { from: 'bg-[#0a0e1a]', to: 'bg-slate-50 dark:bg-[#0a0e1a]' },
  { from: 'bg-[#0d1225]/95', to: 'bg-white/95 dark:bg-[#0d1225]/95' },
  { from: 'bg-[#131830]/90', to: 'bg-white/90 dark:bg-[#131830]/90' },
  { from: 'bg-[#0f152e]', to: 'bg-white dark:bg-[#0f152e]' },
  { from: 'bg-white/\\[0\\.03\\]', to: 'bg-white dark:bg-white/[0.03]' },
  { from: 'bg-white/\\[0\\.02\\]', to: 'bg-white dark:bg-white/[0.02]' },
  { from: 'bg-white/5', to: 'bg-slate-100 dark:bg-white/5' },
  { from: 'bg-white/10', to: 'bg-slate-200 dark:bg-white/10' },
  
  // Text colors
  { from: 'text-white', to: 'text-slate-900 dark:text-white' },
  { from: 'text-blue-200/50', to: 'text-slate-500 dark:text-blue-200/50' },
  { from: 'text-blue-200/40', to: 'text-slate-500 dark:text-blue-200/40' },
  { from: 'text-blue-200/30', to: 'text-slate-400 dark:text-blue-200/30' },
  { from: 'text-blue-200/70', to: 'text-slate-600 dark:text-blue-200/70' },
  { from: 'text-blue-100', to: 'text-slate-700 dark:text-blue-100' },
  { from: 'text-blue-300/30', to: 'text-slate-400 dark:text-blue-300/30' },
  { from: 'placeholder-blue-300/30', to: 'placeholder-slate-400 dark:placeholder-blue-300/30' },

  // Borders
  { from: 'border-white/\\[0\\.06\\]', to: 'border-slate-200 dark:border-white/[0.06]' },
  { from: 'border-white/\\[0\\.05\\]', to: 'border-slate-200 dark:border-white/[0.05]' },
  { from: 'border-white/\\[0\\.08\\]', to: 'border-slate-200 dark:border-white/[0.08]' },
  { from: 'border-white/5', to: 'border-slate-200 dark:border-white/5' },
  { from: 'border-white/10', to: 'border-slate-200 dark:border-white/10' },
  
  // Gradients
  { from: 'from-white via-blue-100 to-blue-200', to: 'from-slate-900 via-slate-800 to-slate-600 dark:from-white dark:via-blue-100 dark:to-blue-200' },
  { from: 'from-white to-blue-200', to: 'from-slate-900 to-slate-600 dark:from-white dark:to-blue-200' },
  { from: 'via-blue-950/20', to: 'via-slate-200/50 dark:via-blue-950/20' },
  { from: 'from-\\[#0a0e1a\\]/60', to: 'from-slate-900/60 dark:from-[#0a0e1a]/60' },
  { from: 'from-\\[#0a0e1a\\]/80', to: 'from-slate-900/80 dark:from-[#0a0e1a]/80' },
];

let newContent = content;
for (const r of replacements) {
  newContent = newContent.replace(new RegExp('(?<!dark:)' + r.from, 'g'), r.to);
}

// Add Sun/Moon icons to imports
newContent = newContent.replace(
  'Wind } from \'lucide-react\';',
  'Wind, Sun, Moon } from \'lucide-react\';'
);

// Add state for dark mode inside LandingPage component
newContent = newContent.replace(
  'const [sent, setSent] = useState(false);',
  `const [sent, setSent] = useState(false);\n  const [isDark, setIsDark] = useState(true);\n  \n  useEffect(() => {\n    if (typeof window !== 'undefined') {\n      setIsDark(localStorage.getItem('theme') !== 'light');\n    }\n  }, []);\n\n  const toggleTheme = () => {\n    const newTheme = !isDark;\n    setIsDark(newTheme);\n    localStorage.setItem('theme', newTheme ? 'dark' : 'light');\n  };`
);

// Wrap return with dark mode div
newContent = newContent.replace(
  'return (\n    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0e1a] text-slate-900 dark:text-white overflow-x-hidden">',
  'return (\n    <div className={isDark ? "dark" : ""}>\n      <div className="min-h-screen bg-slate-50 dark:bg-[#0a0e1a] text-slate-900 dark:text-white overflow-x-hidden transition-colors duration-500">'
);
newContent = newContent.replace(
  '</footer>\n    </div>',
  '</footer>\n      </div>\n    </div>'
);

// Add toggle button to navbar desktop
newContent = newContent.replace(
  '<Link href="/login" className="px-5 py-2.5 rounded-lg',
  `<button onClick={toggleTheme} className="p-2.5 rounded-xl bg-slate-200 dark:bg-white/5 text-slate-600 dark:text-blue-200 hover:bg-slate-300 dark:hover:bg-white/10 transition-colors">\n              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}\n            </button>\n            <Link href="/login" className="px-5 py-2.5 rounded-lg`
);

// Add toggle button to navbar mobile
newContent = newContent.replace(
  '<Link href="/login" className="block text-center px-5 py-2.5',
  `<button onClick={toggleTheme} className="w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-slate-200 dark:bg-white/5 text-slate-600 dark:text-blue-200 font-medium">\n              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />} {isDark ? 'Light Mode' : 'Dark Mode'}\n            </button>\n            <Link href="/login" className="block text-center px-5 py-2.5`
);

// Also need to handle hover states that were skipped
newContent = newContent.replace(/hover:bg-white\/\\[0\.06\\]/g, 'hover:bg-slate-100 dark:hover:bg-white/[0.06]');
newContent = newContent.replace(/hover:bg-white\/\\[0\.05\\]/g, 'hover:bg-slate-100 dark:hover:bg-white/[0.05]');

fs.writeFileSync('app/(landing)/page.tsx', newContent);
console.log('Done replacing classes');
