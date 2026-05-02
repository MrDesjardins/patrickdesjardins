import unittest

from social_common import find_first_image, parse_frontmatter, strip_mdx


class SocialCommonTests(unittest.TestCase):
    def test_parse_frontmatter_extracts_fields(self):
        content = """---
title: Example
date: 2026-05-01
---
Body
"""
        parsed = parse_frontmatter(content)
        self.assertEqual(parsed["title"], "Example")
        self.assertEqual(str(parsed["date"]), "2026-05-01")

    def test_strip_mdx_removes_markup_and_keeps_text(self):
        content = """---
title: Example
---

# Heading

Text with [link](https://example.com) and `code`.

```ts
console.log("test");
```

<YouTube id="abc" />

- bullet
1. numbered
"""
        stripped = strip_mdx(content)
        self.assertIn("Heading", stripped)
        self.assertIn("Text with link and .", stripped)
        self.assertIn("bullet", stripped)
        self.assertIn("numbered", stripped)
        self.assertNotIn("console.log", stripped)
        self.assertNotIn("<YouTube", stripped)

    def test_find_first_image_returns_none_when_missing(self):
        content = "No image here"
        self.assertIsNone(find_first_image(content))


if __name__ == "__main__":
    unittest.main()
