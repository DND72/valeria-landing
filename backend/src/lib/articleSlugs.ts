/** Allineare a `src/data/articles.ts` quando aggiungi articoli. */
export const ARTICLE_SLUGS = [
  'visione-jungiana-tarocchi',
  'sillogismo-scacchistico-disciplina-interiore',
] as const

export type ArticleSlug = (typeof ARTICLE_SLUGS)[number]

export function isValidArticleSlug(s: string): s is ArticleSlug {
  return (ARTICLE_SLUGS as readonly string[]).includes(s)
}
