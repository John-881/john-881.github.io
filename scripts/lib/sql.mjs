import { readFileSync } from 'node:fs'
import { gunzipSync } from 'node:zlib'

/**
 * Literal-aware MySQL dump scanner.
 * A statement ends at a ';' outside any string literal. Comments are skipped.
 */
export function splitStatements(sql) {
  const out = []
  const n = sql.length
  let start = 0
  let i = 0
  while (i < n) {
    const ch = sql[i]
    if (ch === "'" || ch === '"' || ch === '\u0060') {
      const quote = ch
      i++
      while (i < n) {
        const c = sql[i]
        if (c === '\\' && quote !== '\u0060') { i += 2; continue }
        if (c === quote) {
          if (sql[i + 1] === quote) { i += 2; continue }
          i++
          break
        }
        i++
      }
      continue
    }
    if (ch === '-' && sql[i + 1] === '-' && (sql[i + 2] === ' ' || sql[i + 2] === '\t' || sql[i + 2] === '\n' || sql[i + 2] === '\r' || i + 2 >= n)) {
      i = skipToEol(sql, i)
      continue
    }
    if (ch === '#') { i = skipToEol(sql, i); continue }
    if (ch === '/' && sql[i + 1] === '*') {
      const close = sql.indexOf('*/', i + 2)
      i = close < 0 ? n : close + 2
      continue
    }
    if (ch === ';') {
      out.push(sql.slice(start, i))
      i++
      start = i
      continue
    }
    i++
  }
  if (start < n) out.push(sql.slice(start, n))
  return out.filter((s) => s.trim().length > 0)
}

function skipToEol(sql, i) {
  const nl = sql.indexOf('\n', i)
  return nl < 0 ? sql.length : nl + 1
}

/** Parse CREATE TABLE statements into { tableName: [columnName, ...] } preserving declaration order. */
export function parseCreateTables(sql) {
  const creates = {}
  for (const stmt of splitStatements(sql)) {
    const head = stmt.replace(/^\s+/, '')
    const m = /^CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?\u0060?([A-Za-z0-9_$]+)\u0060?\s*\(/i.exec(head)
    if (!m) continue
    const open = head.indexOf('(', m.index + m[0].length - 1)
    const close = matchParen(head, open)
    const body = head.slice(open + 1, close)
    const cols = []
    for (const line of body.split('\n')) {
      const cm = /^\s*\u0060([^\u0060]+)\u0060\s/.exec(line)
      if (cm) cols.push(cm[1])
    }
    creates[m[1]] = cols
  }
  return creates
}

function matchParen(text, open) {
  let depth = 0
  for (let i = open; i < text.length; i++) {
    if (text[i] === '(') depth++
    else if (text[i] === ')') {
      depth--
      if (depth === 0) return i
    }
  }
  return text.length
}

/** Parse INSERT INTO statements using the CREATE TABLE column order. */
export function parseInserts(sql, creates) {
  const rows = {}
  for (const stmt of splitStatements(sql)) {
    const head = stmt.replace(/^\s+/, '')
    const m = /^INSERT\s+(?:IGNORE\s+)?INTO\s+\u0060?([A-Za-z0-9_$]+)\u0060?\s*(\([^)]*\))?\s*VALUES/i.exec(head)
    if (!m) continue
    const table = m[1]
    const cols = m[2]
      ? m[2].slice(1, -1).split(',').map((c) => c.trim().replace(/^\u0060|\u0060$/g, ''))
      : creates[table]
    if (!cols) throw new Error('parseInserts: no column order for table ' + table)
    const valuesAt = m.index + m[0].length
    const tuples = parseTuples(head, valuesAt)
    if (!rows[table]) rows[table] = []
    for (const t of tuples) {
      if (t.length !== cols.length) {
        throw new Error('parseInserts: column/value count mismatch in ' + table + ': ' + t.length + ' vs ' + cols.length)
      }
      rows[table].push(t)
    }
  }
  return rows
}

/** Parse the "(...),(...)" tuple list after VALUES, returning raw (still escaped) cell values. */
export function parseTuples(text, from) {
  const tuples = []
  let i = from
  const n = text.length
  while (i < n) {
    while (i < n && /\s/.test(text[i])) i++
    if (i >= n) break
    if (text[i] === ';') break
    if (text[i] === ',') { i++; continue }
    if (text[i] !== '(') throw new Error('parseTuples: expected ( at offset ' + i + ', got ' + JSON.stringify(text.slice(i, i + 20)))
    i++
    const vals = []
    let cur = null
    let buf = ''
    let expectVal = true
    while (i < n) {
      const c = text[i]
      if (cur === null) {
        if (c === "'" || c === '"') {
          if (!expectVal) throw new Error('parseTuples: unexpected quote at offset ' + i)
          cur = c; buf = ''; expectVal = false; i++; continue
        }
        if (c === ',') { if (expectVal) vals.push(null); expectVal = true; i++; continue }
        if (c === ')') { if (expectVal) vals.push(null); i++; break }
        if (/\s/.test(c)) { i++; continue }
        let j = i
        while (j < n && text[j] !== ',' && text[j] !== ')') j++
        vals.push(coerceBare(text.slice(i, j).trim()))
        expectVal = false
        i = j
        continue
      }
      if (c === '\\') { buf += c + (text[i + 1] ?? ''); i += 2; continue }
      if (c === cur) {
        if (text[i + 1] === cur) { buf += cur + cur; i += 2; continue }
        i++
        vals.push(unescapeString(buf))
        cur = null
        buf = ''
        continue
      }
      buf += c
      i++
    }
    tuples.push(vals)
  }
  return tuples
}

function coerceBare(raw) {
  if (raw === '' || /^NULL$/i.test(raw)) return null
  return raw
}

export function unescapeString(s) {
  let out = ''
  for (let i = 0; i < s.length; i++) {
    const c = s[i]
    if (c !== '\\') { out += c; continue }
    const d = s[++i]
    switch (d) {
      case '0': out += '\u0000'; break
      case 'b': out += '\b'; break
      case 'n': out += '\n'; break
      case 'r': out += '\r'; break
      case 't': out += '\t'; break
      case 'Z': out += '\u001a'; break
      case '%': out += '\\%'; break
      case '_': out += '\\_'; break
      case undefined: out += '\\'; break
      default: out += d
    }
  }
  return out
}

/** Read a .sql or .sql.gz dump and return { creates, rows, sql }. */
export function loadDump(gzPath) {
  const buf = readFileSync(gzPath)
  const isGzip = buf.length > 2 && buf[0] === 0x1f && buf[1] === 0x8b
  const sql = (isGzip ? gunzipSync(buf) : buf).toString('utf8')
  const creates = parseCreateTables(sql)
  const rows = parseInserts(sql, creates)
  return { creates, rows, sql }
}

/** Convert positional row arrays into objects keyed by column name. */
export function toObjects(creates, rows, table) {
  const cols = creates[table] || []
  const list = rows[table] || []
  return list.map((r) => {
    const o = {}
    for (let i = 0; i < cols.length; i++) o[cols[i]] = r[i]
    return o
  })
}
