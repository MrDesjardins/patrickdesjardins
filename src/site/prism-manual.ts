// Must be imported before "prismjs" so Prism does not auto-highlight the whole
// document on load. We trigger highlighting explicitly once the grammars are
// registered.
(window as unknown as { Prism?: { manual?: boolean } }).Prism = {
  ...(window as unknown as { Prism?: { manual?: boolean } }).Prism,
  manual: true,
};

export {};
