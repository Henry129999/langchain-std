import { readFile } from "node:fs/promises";
import path from "node:path";

export interface CourseDocument {
  source: string;
  text: string;
}

export interface TextChunk {
  id: string;
  source: string;
  chunkIndex: number;
  text: string;
}

export interface RetrievedChunk extends TextChunk {
  score: number;
}

const DEFAULT_CHUNK_SIZE = 900;
const DEFAULT_CHUNK_OVERLAP = 120;

function assertInsideProject(filePath: string): string {
  const projectRoot = process.cwd();
  const absolutePath = path.resolve(projectRoot, filePath);
  const relative = path.relative(projectRoot, absolutePath);

  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error(`Refusing to load file outside project: ${filePath}`);
  }

  return absolutePath;
}

function tokenize(text: string): Set<string> {
  const terms = text.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? [];
  return new Set(terms.filter((term) => term.length >= 2));
}

export async function loadCourseDocuments(
  filePaths: string[]
): Promise<CourseDocument[]> {
  const documents: CourseDocument[] = [];

  for (const filePath of filePaths) {
    const absolutePath = assertInsideProject(filePath);
    const text = await readFile(absolutePath, "utf8");
    documents.push({ source: filePath, text });
  }

  return documents;
}

export function splitDocuments(
  documents: CourseDocument[],
  options?: { chunkSize?: number; chunkOverlap?: number }
): TextChunk[] {
  const chunkSize = options?.chunkSize ?? DEFAULT_CHUNK_SIZE;
  const chunkOverlap = options?.chunkOverlap ?? DEFAULT_CHUNK_OVERLAP;
  const chunks: TextChunk[] = [];

  for (const document of documents) {
    let start = 0;
    let chunkIndex = 0;

    while (start < document.text.length) {
      const text = document.text.slice(start, start + chunkSize).trim();

      if (text) {
        chunks.push({
          id: `${document.source}#${chunkIndex}`,
          source: document.source,
          chunkIndex,
          text,
        });
      }

      chunkIndex += 1;
      start += Math.max(1, chunkSize - chunkOverlap);
    }
  }

  return chunks;
}

export function retrieveRelevantChunks(
  query: string,
  chunks: TextChunk[],
  topK = 4
): RetrievedChunk[] {
  const queryTerms = tokenize(query);

  return chunks
    .map((chunk) => {
      const chunkTerms = tokenize(chunk.text);
      let overlap = 0;

      for (const term of queryTerms) {
        if (chunkTerms.has(term)) {
          overlap += 1;
        }
      }

      return {
        ...chunk,
        score: queryTerms.size === 0 ? 0 : overlap / queryTerms.size,
      };
    })
    .filter((chunk) => chunk.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}

export function formatRetrievedChunks(chunks: RetrievedChunk[]): string {
  if (chunks.length === 0) {
    return "没有检索到相关片段。";
  }

  return chunks
    .map((chunk) => {
      return [
        `[${chunk.id}] score=${chunk.score.toFixed(2)}`,
        chunk.text,
      ].join("\n");
    })
    .join("\n\n---\n\n");
}
