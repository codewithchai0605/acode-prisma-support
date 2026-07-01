import { buildParserFile } from "@lezer/generator"
import { readFileSync, writeFileSync, mkdirSync } from "fs"
import { dirname, join } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, "..")

const langs = [
  { dir: "prisma", grammar: "prisma.grammar" },
]

for (const lang of langs) {
  const grammarPath = join(root, `src/languages/${lang.dir}/${lang.grammar}`)
  const outputDir = join(root, `src/languages/${lang.dir}`)

  const grammar = readFileSync(grammarPath, "utf8")

  const result = buildParserFile(grammar, {
    outputParser: "parser.js",
    outputTerms: "parser.terms.js",
    moduleStyle: "es",
    warn: (msg) => console.warn(`WARN [${lang.dir}]:`, msg),
  })

  mkdirSync(outputDir, { recursive: true })
  writeFileSync(join(outputDir, "parser.js"), result.parser)
  writeFileSync(join(outputDir, "parser.terms.js"), result.terms)
  console.log(`[${lang.dir}] parser generated successfully`)
}
