import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

let cachedKnowledge: string | null = null

export async function getKnowledgeBase(): Promise<string> {
  if (cachedKnowledge) return cachedKnowledge

  const resourcesDir = path.join(__dirname, '../../resources/knowledge_base')
  let combinedKnowledge = ''
  
  try {
    const files = await fs.readdir(resourcesDir)
    const txtFiles = files.filter(f => f.endsWith('.txt'))
    
    for (const file of txtFiles) {
      const content = await fs.readFile(path.join(resourcesDir, file), 'utf-8')
      combinedKnowledge += `\n--- SOURCE: ${file} ---\n${content}\n`
    }
    
    cachedKnowledge = combinedKnowledge
    return combinedKnowledge
  } catch (err) {
    console.error('[knowledge-base-error]', err)
    return ''
  }
}
