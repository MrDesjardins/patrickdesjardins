import importlib.util
import json
import os
import sys
import tempfile
import unittest
from unittest.mock import MagicMock, patch

import numpy as np

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
MAIN_PATH = os.path.join(SCRIPT_DIR, "../search/main.py")


def load_main_module():
    spec = importlib.util.spec_from_file_location("search_main", MAIN_PATH)
    module = importlib.util.module_from_spec(spec)
    assert spec.loader is not None
    sys.modules["search_main"] = module
    spec.loader.exec_module(module)
    return module


class SearchIncrementalTests(unittest.TestCase):
    def setUp(self):
        self.main = load_main_module()
        self.temp_dir = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp_dir.cleanup)
        self.posts_dir = os.path.join(self.temp_dir.name, "posts")
        self.cli_dir = os.path.join(self.temp_dir.name, "cli")
        self.web_dir = os.path.join(self.temp_dir.name, "web")
        os.makedirs(self.posts_dir, exist_ok=True)
        os.makedirs(self.cli_dir, exist_ok=True)
        os.makedirs(self.web_dir, exist_ok=True)

        self.original_collections = self.main.COLLECTIONS
        self.main.COLLECTIONS = {
            **self.original_collections,
            "blog": {
                **self.original_collections["blog"],
                "posts_dir": self.posts_dir,
                "output_dir_cli": self.cli_dir,
                "output_web": self.web_dir,
            },
        }
        self.addCleanup(lambda: setattr(self.main, "COLLECTIONS", self.original_collections))

    def make_document(self, filename: str, title: str, body: str) -> object:
        abs_path = os.path.join(self.posts_dir, filename)
        with open(abs_path, "w", encoding="utf-8") as file:
            file.write(f'---\ntitle: "{title}"\ndate: "2026-01-01"\n---\n{body}')
        return self.main.Document(
            rel_path=f"src/_posts/2026/{filename}",
            abs_path=abs_path,
            filename=filename,
            title=title,
            content_hash=self.main.content_hash(body),
            text=body,
        )

    def test_incremental_reuses_embeddings_for_unchanged_documents(self):
        doc = self.make_document("incremental-test-post.mdx", "Incremental Test", "Body one")
        vector = np.arange(self.main.DEFAULT_DIMS, dtype=np.float64)
        manifest = {
            "schema": self.main.MANIFEST_SCHEMA,
            "model": self.main.MODEL,
            "entries": {
                doc.rel_path: {
                    "content_hash": doc.content_hash,
                    "title": doc.title,
                    "filename": doc.filename,
                }
            },
        }
        index = [
            {
                "path": doc.abs_path,
                "rel_path": doc.rel_path,
                "filename": doc.filename,
                "title": doc.title,
            }
        ]
        with open(os.path.join(self.cli_dir, "manifest.json"), "w", encoding="utf-8") as file:
            json.dump(manifest, file)
        with open(os.path.join(self.cli_dir, "index.json"), "w", encoding="utf-8") as file:
            json.dump(index, file)
        np.save(os.path.join(self.cli_dir, "embeddings.npy"), np.stack([vector]))

        model = MagicMock()
        model.get_sentence_embedding_dimension.return_value = self.main.DEFAULT_DIMS
        model.encode = MagicMock()

        with patch.object(self.main, "scan_documents", return_value=[doc]):
            self.main.generate_index_for_collection("blog", model)

        model.encode.assert_not_called()
        saved = np.load(os.path.join(self.cli_dir, "embeddings.npy"))
        self.assertTrue(np.allclose(saved[0], vector))

    def test_incremental_encodes_only_changed_documents(self):
        doc = self.make_document("incremental-changed-post.mdx", "Changed Post", "Body two")
        old_vector = np.zeros(self.main.DEFAULT_DIMS, dtype=np.float64)
        new_vector = np.ones(self.main.DEFAULT_DIMS, dtype=np.float64)
        manifest = {
            "schema": self.main.MANIFEST_SCHEMA,
            "model": self.main.MODEL,
            "entries": {
                doc.rel_path: {
                    "content_hash": "stale-hash",
                    "title": doc.title,
                    "filename": doc.filename,
                }
            },
        }
        index = [
            {
                "path": doc.abs_path,
                "rel_path": doc.rel_path,
                "filename": doc.filename,
                "title": doc.title,
            }
        ]
        with open(os.path.join(self.cli_dir, "manifest.json"), "w", encoding="utf-8") as file:
            json.dump(manifest, file)
        with open(os.path.join(self.cli_dir, "index.json"), "w", encoding="utf-8") as file:
            json.dump(index, file)
        np.save(os.path.join(self.cli_dir, "embeddings.npy"), np.stack([old_vector]))

        model = MagicMock()
        model.get_sentence_embedding_dimension.return_value = self.main.DEFAULT_DIMS
        encoded = MagicMock()
        encoded.cpu.return_value.numpy.return_value = np.stack([new_vector])
        model.encode.return_value = encoded

        with patch.object(self.main, "scan_documents", return_value=[doc]):
            self.main.generate_index_for_collection("blog", model)

        model.encode.assert_called_once_with([doc.text], convert_to_tensor=True)
        saved = np.load(os.path.join(self.cli_dir, "embeddings.npy"))
        self.assertTrue(np.allclose(saved[0], new_vector))
        self.assertTrue(os.path.exists(os.path.join(self.web_dir, "embeddings.bin")))


if __name__ == "__main__":
    unittest.main()
