import { readdirSync, readFileSync } from 'node:fs'
import assert from 'node:assert/strict'

// The public index and the live demo imports must cover every runtime component.
// This protects discoverability when future agents add exports to the shared kit.
const sourceFiles = readdirSync('src').filter(name => name.endsWith('.tsx'))
const exports = new Set(sourceFiles.flatMap(name => [...readFileSync(`src/${name}`, 'utf8').matchAll(/^export function (Ui\w+)/gm)].map(match => match[1])))
const groups = JSON.parse(readFileSync('docs/catalog.json', 'utf8'))
const listed = Object.values(groups).flat()
const examples = readFileSync('docs/examples.tsx', 'utf8')
const importBlock = examples.match(/import \{\n([\s\S]*?)\} from '\.\.\/src'/)?.[1]
assert.ok(importBlock, 'Examples must import the public kit')
const imported = importBlock.split(',').map(name => name.trim()).filter(Boolean)
const main = readFileSync('docs/main.tsx', 'utf8')
const sections = [...main.matchAll(/label: '([^']+)', detail:/g)].map(match => match[1])
assert.equal(new Set(listed).size, listed.length, 'Each component belongs to exactly one catalog group')
assert.deepEqual([...listed].sort(), [...exports].sort(), 'Catalog index must include all exported components')
assert.deepEqual([...imported].sort(), [...exports].sort(), 'Live examples must use all exported components')
assert.deepEqual(sections.sort(), Object.keys(groups).sort(), 'Every catalog group needs a visible section')
console.log(`Catalog covers all ${exports.size} exported components in live examples.`)
