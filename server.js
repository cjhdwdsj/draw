/**
 * 实况足球手机版 - 球员数据 REST API 服务器
 * PES Mobile Player Data REST API Server
 *
 * 使用内置模块，无需安装任何依赖。
 *
 * 启动：node server.js
 * 默认端口：3000（可通过环境变量 PORT 修改）
 *
 * API 端点：
 *   GET    /api/players         - 获取所有球员列表
 *   GET    /api/players/:index  - 获取指定索引的球员
 *   POST   /api/players         - 新增球员
 *   PUT    /api/players/:index  - 更新指定索引的球员（部分更新）
 *   DELETE /api/players/:index  - 删除指定索引的球员
 */

'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'players_data_complete.json');
const BODY_LIMIT = 1 * 1024 * 1024; // 1 MB

// ---------- 数据读写辅助函数 ----------

async function readData() {
    const raw = await fs.promises.readFile(DATA_FILE, 'utf8');
    return JSON.parse(raw);
}

async function writeData(data) {
    // 先写临时文件再重命名，保证原子写入
    const tmp = DATA_FILE + '.tmp';
    await fs.promises.writeFile(tmp, JSON.stringify(data, null, 2), 'utf8');
    await fs.promises.rename(tmp, DATA_FILE);
}

// ---------- HTTP 响应辅助函数 ----------

function sendJSON(res, status, data) {
    const body = JSON.stringify(data, null, 2);
    res.writeHead(status, {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Length': Buffer.byteLength(body)
    });
    res.end(body);
}

function readBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        let size = 0;
        req.on('data', chunk => {
            size += chunk.length;
            if (size > BODY_LIMIT) {
                reject(Object.assign(new Error('请求体超过 1MB 限制'), { status: 413 }));
                req.destroy();
                return;
            }
            body += chunk;
        });
        req.on('end', () => {
            try { resolve(JSON.parse(body)); }
            catch (e) { reject(new Error('无效的 JSON 请求体')); }
        });
        req.on('error', reject);
    });
}

// ---------- 静态文件服务 ----------

const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.js':   'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.mp3':  'audio/mpeg',
    '.css':  'text/css; charset=utf-8',
    '.ico':  'image/x-icon'
};

function serveStatic(req, res, pathname) {
    const filePath = path.join(__dirname, pathname === '/' ? 'index.html' : pathname);
    // 防止路径穿越及目录遍历
    if (!filePath.startsWith(__dirname + path.sep) || filePath === __dirname) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
    }
    fs.readFile(filePath, (err, content) => {
        if (err) {
            res.writeHead(404);
            res.end('Not Found');
            return;
        }
        const ext = path.extname(filePath);
        res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
        res.end(content);
    });
}

// ---------- 路由处理 ----------

async function handleRequest(req, res) {
    const { pathname } = new URL(req.url, `http://localhost`);
    const method = req.method.toUpperCase();

    // CORS 支持（本地开发用途，如部署到公网请限制为具体域名）
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    // GET /api/players — 获取所有球员
    if (pathname === '/api/players' && method === 'GET') {
        const data = await readData();
        sendJSON(res, 200, data['球员']);
        return;
    }

    // POST /api/players — 新增球员
    if (pathname === '/api/players' && method === 'POST') {
        try {
            const player = await readBody(req);
            const data = await readData();
            data['球员'].push(player);
            await writeData(data);
            sendJSON(res, 201, { index: data['球员'].length - 1, player });
        } catch (e) {
            sendJSON(res, e.status || 400, { error: e.message });
        }
        return;
    }

    // /api/players/:index 路由
    const match = pathname.match(/^\/api\/players\/(\d+)$/);
    if (match) {
        const index = parseInt(match[1], 10);

        // GET /api/players/:index — 获取指定球员
        if (method === 'GET') {
            const data = await readData();
            const player = data['球员'][index];
            if (player === undefined) {
                sendJSON(res, 404, { error: `索引 ${index} 的球员不存在` });
                return;
            }
            sendJSON(res, 200, player);
            return;
        }

        // PUT /api/players/:index — 更新指定球员（部分更新）
        if (method === 'PUT') {
            try {
                const updates = await readBody(req);
                const data = await readData();
                if (data['球员'][index] === undefined) {
                    sendJSON(res, 404, { error: `索引 ${index} 的球员不存在` });
                    return;
                }
                data['球员'][index] = { ...data['球员'][index], ...updates };
                await writeData(data);
                sendJSON(res, 200, data['球员'][index]);
            } catch (e) {
                sendJSON(res, e.status || 400, { error: e.message });
            }
            return;
        }

        // DELETE /api/players/:index — 删除指定球员
        if (method === 'DELETE') {
            const data = await readData();
            if (data['球员'][index] === undefined) {
                sendJSON(res, 404, { error: `索引 ${index} 的球员不存在` });
                return;
            }
            const [removed] = data['球员'].splice(index, 1);
            await writeData(data);
            sendJSON(res, 200, removed);
            return;
        }
    }

    // 非 API 路径 — 静态文件服务
    if (!pathname.startsWith('/api/')) {
        serveStatic(req, res, pathname);
        return;
    }

    // 未匹配的 API 路径
    sendJSON(res, 404, { error: '接口不存在' });
}

// ---------- 服务器启动 ----------

const PORT = parseInt(process.env.PORT, 10) || 3000;

const server = http.createServer((req, res) => {
    handleRequest(req, res).catch(err => {
        console.error('Unhandled error:', err);
        if (!res.headersSent) {
            sendJSON(res, 500, { error: '服务器内部错误' });
        }
    });
});

server.listen(PORT, () => {
    console.log(`✅ 服务器已启动: http://localhost:${PORT}`);
    console.log('');
    console.log('API 端点:');
    console.log(`  GET    http://localhost:${PORT}/api/players         获取所有球员`);
    console.log(`  GET    http://localhost:${PORT}/api/players/:index  获取指定球员`);
    console.log(`  POST   http://localhost:${PORT}/api/players         新增球员`);
    console.log(`  PUT    http://localhost:${PORT}/api/players/:index  更新指定球员`);
    console.log(`  DELETE http://localhost:${PORT}/api/players/:index  删除指定球员`);
    console.log('');
    console.log(`前端页面: http://localhost:${PORT}/`);
});
