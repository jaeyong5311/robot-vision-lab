import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const supplied=process.env.SITE_URL;
if (!supplied) throw new Error('SITE_URL is required');
const parsed=new URL(supplied);
if (parsed.protocol !== 'https:' || parsed.username || parsed.password || parsed.search || parsed.hash) throw new Error('Expected a public HTTPS site URL');
const url=parsed.href.replace(/\/$/,'');
const escape=value=>value.replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const filename=path.join(root,'docs/index.html');
const html=await fs.readFile(filename,'utf8');
const start='<!-- public-url:start -->', end='<!-- public-url:end -->';
if (!html.includes(start) || !html.includes(end)) throw new Error('Metadata markers are missing');
const tags=[start, '<meta property="og:url" content="'+escape(url)+'">', '<meta property="og:image" content="'+escape(url+'/assets/social-preview.png')+'">', '<link rel="canonical" href="'+escape(url)+'">', end].join('\n');
const first=html.indexOf(start), last=html.indexOf(end)+end.length;
await fs.writeFile(filename, html.slice(0,first)+tags+html.slice(last));
console.log('Public page metadata updated.');
