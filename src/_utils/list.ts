import { MdxData } from "../lib/api";

export function sortByMetadataDateDesc(a: MdxData, b: MdxData) {
  return new Date(a.metadata.date) > new Date(b.metadata.date) ? -1 : 1;
}

export function sortByMetadataDateAsc(a: MdxData, b: MdxData) {
  return new Date(a.metadata.date) < new Date(b.metadata.date) ? -1 : 1;
}
