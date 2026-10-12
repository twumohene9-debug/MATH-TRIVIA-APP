import React, { useMemo } from 'react';
import katex from 'katex';

interface MathTextProps {
  text: string;
  className?: string;
  inline?: boolean;
}

/**
 * Safely cleans and standardizes math text strings:
 * - Removes (**) or ** emphasis markers and converts them to bold/underline tags
 * - Fixes malformed currency symbols like `$$120$` or `$\$120$`
 * - Un-nests illegal `$\text{... $x$ ...}$` constructs
 * - Fixes unbraced multi-digit exponents and subscripts in LaTeX (e.g. `^10` -> `^{10}`)
 * - Fixes malformed fractions without braces (e.g. `\frac 1 2` -> `\frac{1}{2}`)
 */
function sanitizeMathText(raw: string): string {
  if (!raw) return '';
  let s = raw;

  // 0. Remove redundant/meaningless parenthetical angle bracket notation outside math mode
  s = s.replace(/\(\s*<(?:\s*,\s*>)?\s*\)/g, '');
  s = s.replace(/\(\s*>(?:\s*,\s*<)?\s*\)/g, '');
  s = s.replace(/\(\s*<\s*or\s*>\s*\)/g, '');
  s = s.replace(/\(\s*<,\s*>,\s*=\s*\)/g, '');
  s = s.replace(/\s*\(\s*<\s*\)\s*/g, ' ');
  s = s.replace(/\s*\(\s*>\s*\)\s*/g, ' ');

  // 1. Remove Markdown asterisks wrapping math expressions before math tokenization:
  // e.g. **$50,000$** -> $50,000$ or **$$y = mx + c$$** -> $$y = mx + c$$
  s = s.replace(/\*\*(\$\$[\s\S]*?\$\$|\$(?:\\\$|[^\$])+?\$)\*\*/g, '$1');
  s = s.replace(/\*(\$\$[\s\S]*?\$\$|\$(?:\\\$|[^\$])+?\$)\*/g, '$1');

  // Strip all markdown bold/italic asterisks from plain text:
  // **bold** -> bold, *italic* -> italic
  s = s.replace(/\*\*([^*]+?)\*\*/g, '$1');
  s = s.replace(/\*([^*]+?)\*/g, '$1');

  // Strip HTML formatting tags
  s = s.replace(/<(?:b|strong|u|i|em)>([\s\S]+?)<\/(?:b|strong|u|i|em)>/gi, '$1');
  s = s.replace(/<\/?[a-zA-Z][^>]*>/g, '');

  // Clean up any remaining (**) or orphan ** markers
  s = s.replace(/\(\*\*\)\s*([^\(\)]+?)\s*\(\*\*\)/g, '$1');
  s = s.replace(/\(\*\*([^\*]+?)\*\*\)/g, '$1');
  s = s.replace(/\s*\(\*\*\)\s*/g, ' ');

  // 2. Standardize currency: \text{GH¢} and \$ inside math mode
  s = s.replace(/\${1,2}\\?\$([0-9.,]+)\$/g, '$\\text{GH¢}$1$');
  s = s.replace(/GH¢\s*([0-9.,]+)/g, '$\\text{GH¢}$1$');
  s = s.replace(/([=><:\s])\\\$\\?([0-9.,]+)/g, '$1$\\text{\\$} $2$');

  // 3. Protect math tokens ($...$ and $$...$$)
  const mathTokens: string[] = [];
  s = s.replace(/(\$\$[\s\S]*?\$\$|\$(?:\\\$|[^\$])+?\$)/g, (m) => {
    let math = m;
    // Inside math: convert bare asterisks to \ast
    // e.g. $a * b$ -> $a \ast b$
    math = math.replace(/(?<!\\)\*/g, '\\ast ');
    mathTokens.push(math);
    return `___MATH_TOKEN_${mathTokens.length - 1}___`;
  });

  // Convert unit superscripts like cm², m², cm³, m³ outside math
  s = s.replace(/\b(cm|mm|m|km)\s*²\b/g, '$\\text{$1}^2$');
  s = s.replace(/\b(cm|mm|m|km)\s*³\b/g, '$\\text{$1}^3$');
  s = s.replace(/([a-zA-Z0-9])²/g, '$1^2');
  s = s.replace(/([a-zA-Z0-9])³/g, '$1^3');

  // Convert mixed fractions e.g. "3 1/4" -> "$3\dfrac{1}{4}$"
  s = s.replace(/\b(\d+)\s+(\d+)\/(\d+)\b/g, (_, w, n, d) => `$${w}\\dfrac{${n}}{${d}}$`);

  // Convert standalone simple fractions e.g. "3/4" -> "$\dfrac{3}{4}$"
  s = s.replace(/(^|[^a-zA-Z0-9_\-\/.])(\d+)\/(\d+)(?=[^a-zA-Z0-9_\-\/.]|$)/g, (_, pre, n, d) => `${pre}$\\dfrac{${n}}{${d}}$`);

  // Convert negative standalone fractions e.g. "-1/2" -> "$-\dfrac{1}{2}$"
  s = s.replace(/(^|[^a-zA-Z0-9_\-\/.])-(\d+)\/(\d+)(?=[^a-zA-Z0-9_\-\/.]|$)/g, (_, pre, n, d) => `${pre}$-\\dfrac{${n}}{${d}}$`);

  // Convert plain text ratios like "3 : 5" outside math -> "$3 : 5$"
  s = s.replace(/(^|[^a-zA-Z0-9_\-\/.])(\d+)\s*:\s*(\d+)(?=[^a-zA-Z0-9_\-\/.]|$)/g, (_, pre, a, b) => `${pre}$${a} : ${b}$`);

  // Convert plain text degree notation e.g. "45°" -> "$45^\circ$"
  s = s.replace(/(\d+)\s*°/g, (_, deg) => `$${deg}^\\circ$`);

  // Convert sqrt(n) notation e.g. "sqrt(25)" -> "$\sqrt{25}$"
  s = s.replace(/\bsqrt\(([a-zA-Z0-9\+\-\*\/]+)\)/g, (_, inside) => `$\\sqrt{${inside}}$`);

  // Convert standalone algebraic equations e.g. "2x + 5 = 15", "x = 4", "3a - 2 = 10" outside math
  s = s.replace(/(?:^|(?<=[\s,;:\"'\(]))([a-zA-Z0-9_\-\+\*\/\(\)\^]+(?:\s+[\+\-\*\/]\s+[a-zA-Z0-9_\-\+\*\/\(\)\^]+)*\s*=\s*[-a-zA-Z0-9_\-\+\*\/\(\)\^]+(?:\s+[\+\-\*\/]\s+[-a-zA-Z0-9_\-\+\*\/\(\)\^]+)*)(?=[\.,;:\"'\s\?\)]|$)/g, (_, eq) => {
    const trimmed = eq.trim();
    if (/[a-zA-Z0-9]/.test(trimmed) && trimmed.includes('=')) {
      return `$${trimmed}$`;
    }
    return eq;
  });

  // Convert plain text exponent notation like x^2, 10^4 outside math
  s = s.replace(/\b([a-zA-Z0-9]+)\^([0-9]+)\b/g, (_, b, e) => `$${b}^{${e}}$`);

  // Convert division and multiplication signs outside math
  s = s.replace(/\s+÷\s+/g, ' $\\div$ ');
  s = s.replace(/\s+×\s+/g, ' $\\times$ ');
  s = s.replace(/\s+±\s+/g, ' $\\pm$ ');

  // CRITICAL: Strip any leftover asterisks outside math mode completely!
  s = s.replace(/\*+/g, '');

  // Restore protected math tokens
  s = s.replace(/___MATH_TOKEN_(\d+)___/g, (_, idx) => mathTokens[parseInt(idx, 10)]);

  // 4. Standardize within math mode tokens ($...$ and $$...$$):
  s = s.replace(/(\$\$[\s\S]*?\$\$|\$(?:\\\$|[^\$])+?\$)/g, (match) => {
    let m = match;
    m = m.replace(/\\frac(?=[^a-zA-Z])/g, '\\dfrac');
    m = m.replace(/\^([0-9a-zA-Z-]{2,})(?![^{]*\})/g, '^{$1}');
    m = m.replace(/_([0-9a-zA-Z-]{2,})(?![^{]*\})/g, '_{$1}');
    m = m.replace(/_([0-9])([a-zA-Z])/g, '_{$1} $2');
    m = m.replace(/\\dfrac\s*([0-9a-zA-Z])\s*([0-9a-zA-Z])(?![0-9a-zA-Z])/g, '\\dfrac{$1}{$2}');
    m = m.replace(/\\begin\{array\}\{[^}]*@[^}]*\}/g, '\\begin{array}{rr}');
    m = m.replace(/\\text\{GH[¢₵]\}/g, '\\text{GH}\\mkern1mu\\text{c}');
    m = m.replace(/GH[¢₵]/g, '\\text{GH}\\mkern1mu\\text{c}');
    return m;
  });

  // 5. Fix nested dollars inside \text{...}
  s = s.replace(/\$\\text\{([\s\S]*?)\}\$/g, (match, inner) => {
    if (inner.includes('$')) {
      return inner;
    }
    return match;
  });

  return s;
}

/**
 * Safely renders a piece of text that may contain markdown emphasis,
 * HTML styling tags (<b>, <i>, <u>, <strong>, <em>), or raw unescaped LaTeX formulas.
 */
function renderRichTextSegment(rawChunk: string, keyPrefix: string | number): React.ReactNode {
  if (!rawChunk) return null;

  // Split by markdown bold (**...** or <b>...</b> or <strong>...</strong>),
  // underline (__...__ or <u>...</u>),
  // italic (*...* or <i>...</i> or <em>...</em>),
  // or raw LaTeX formulas that were not enclosed in $ (e.g. \frac{a}{b}, \sqrt{x}, \times, \implies, etc.)
  const regex = /(\*\*[^\*]+?\*\*|<b>[\s\S]+?<\/b>|<strong>[\s\S]+?<\/strong>|__[^_]+?__|<u>[\s\S]+?<\/u>|\*[^\*]+?\*|<i>[\s\S]+?<\/i>|<em>[\s\S]+?<\/em>|\\[a-zA-Z]+(?:\{[^{}]*\}|\[[^\[\]]*\])*)/g;
  const parts = rawChunk.split(regex);

  return (
    <React.Fragment key={keyPrefix}>
      {parts.map((part, pIdx) => {
        if (!part) return null;

        // Bold emphasis: **word** or <b>word</b> or <strong>word</strong>
        if (
          (part.startsWith('**') && part.endsWith('**') && part.length >= 4) ||
          (part.startsWith('<b>') && part.endsWith('</b>')) ||
          (part.startsWith('<strong>') && part.endsWith('</strong>'))
        ) {
          const inner = part.startsWith('**')
            ? part.slice(2, -2)
            : part.startsWith('<b>')
            ? part.slice(3, -4)
            : part.slice(8, -9);
          return (
            <strong
              key={`${keyPrefix}-b-${pIdx}`}
              className="font-bold text-amber-500 dark:text-amber-400"
            >
              {inner}
            </strong>
          );
        }

        // Underline emphasis: __word__ or <u>word</u>
        if (
          (part.startsWith('__') && part.endsWith('__') && part.length >= 4) ||
          (part.startsWith('<u>') && part.endsWith('</u>'))
        ) {
          const inner = part.startsWith('__') ? part.slice(2, -2) : part.slice(3, -4);
          return (
            <span
              key={`${keyPrefix}-u-${pIdx}`}
              className="underline decoration-pink-500 decoration-2 underline-offset-4 font-medium"
            >
              {inner}
            </span>
          );
        }

        // Italic emphasis: *word* or <i>word</i> or <em>word</em>
        if (
          (part.startsWith('*') && part.endsWith('*') && part.length >= 2) ||
          (part.startsWith('<i>') && part.endsWith('</i>')) ||
          (part.startsWith('<em>') && part.endsWith('</em>'))
        ) {
          const inner = part.startsWith('*')
            ? part.slice(1, -1)
            : part.startsWith('<i>')
            ? part.slice(3, -4)
            : part.slice(4, -5);
          return (
            <em key={`${keyPrefix}-i-${pIdx}`} className="italic font-medium text-sky-600 dark:text-sky-400">
              {inner}
            </em>
          );
        }

        // Raw LaTeX formula that escaped $ delimiters
        if (part.startsWith('\\') && /[a-zA-Z]/.test(part[1] || '')) {
          try {
            const html = katex.renderToString(part, {
              displayMode: false,
              throwOnError: false,
              strict: false,
              output: 'html',
            });
            return (
              <span
                key={`${keyPrefix}-rawlatex-${pIdx}`}
                className="inline-block mx-0.5 align-baseline"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            );
          } catch {
            return <span key={`${keyPrefix}-rawlatex-${pIdx}`}>{part}</span>;
          }
        }

        // Strip any residual meaningless angle brackets and asterisks outside math
        const cleanText = part
          .replace(/\*+/g, '')
          .replace(/<\/?[^>]+(>|$)/g, '')
          .replace(/\s*\(\s*<\s*\)\s*/g, ' ')
          .replace(/\s*\(\s*>\s*\)\s*/g, ' ')
          .replace(/\(\s*<,\s*>\s*\)/g, '');

        return <span key={`${keyPrefix}-txt-${pIdx}`}>{cleanText}</span>;
      })}
    </React.Fragment>
  );
}

export const MathText: React.FC<MathTextProps> = ({ text, className = '', inline = false }) => {
  const renderedContent = useMemo(() => {
    if (!text) return null;

    const sanitized = sanitizeMathText(text);

    // Check if the entire string is already a raw latex formula without $ delimiters
    // e.g. "\frac{3}{4}" or "x^2 + 5"
    if (sanitized.startsWith('\\') && !sanitized.includes('$')) {
      try {
        const formatted = (sanitized.includes('\\frac') || sanitized.includes('\\dfrac')) && !sanitized.includes('\\displaystyle')
          ? `\\displaystyle ${sanitized}`
          : sanitized;
        const html = katex.renderToString(formatted, {
          displayMode: !inline,
          throwOnError: false,
          strict: false,
          output: 'html',
        });
        return <span className="inline-block mx-0.5 align-middle leading-normal" dangerouslySetInnerHTML={{ __html: html }} />;
      } catch {
        return <span className="inline-block mx-0.5 align-middle leading-normal">{sanitized}</span>;
      }
    }

    // Split text by $$ (display math) and $ (inline math)
    // Supports escaped dollar signs within math tokens
    const tokens = sanitized.split(/(\$\$[\s\S]*?\$\$|\$(?:\\\$|[^\$])+?\$)/g);

    return tokens.map((token, idx) => {
      if (!token) return null;

      // Display math ($$ ... $$)
      if (token.startsWith('$$') && token.endsWith('$$') && token.length >= 4) {
        const math = token.slice(2, -2).trim();
        if (!math) return null;
        try {
          const html = katex.renderToString(math, {
            displayMode: !inline,
            throwOnError: false,
            strict: false,
            output: 'html',
          });
          return (
            <span
              key={idx}
              className={inline ? 'inline-block mx-1' : 'block my-2.5 w-full text-center overflow-x-auto py-1'}
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        } catch {
          return <span key={idx}>{math}</span>;
        }
      }

      // Inline math ($ ... $)
      if (token.startsWith('$') && token.endsWith('$') && token.length >= 2) {
        // Strip outer single dollars
        const math = token.slice(1, -1).trim();
        if (!math) return null;
        try {
          const formattedMath = (math.includes('\\frac') || math.includes('\\dfrac')) && !math.includes('\\displaystyle')
            ? `\\displaystyle ${math}`
            : math;

          const html = katex.renderToString(formattedMath, {
            displayMode: false,
            throwOnError: false,
            strict: false,
            output: 'html',
          });
          return (
            <span
              key={idx}
              className="inline-block mx-0.5 align-middle leading-normal"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        } catch {
          return <span key={idx}>{math}</span>;
        }
      }

      // Non-math text token: format with bold/italics/underline and recover any raw LaTeX
      return renderRichTextSegment(token, idx);
    });
  }, [text, inline]);

  return <span className={`inline-math-container ${className}`}>{renderedContent}</span>;
};

export default MathText;
