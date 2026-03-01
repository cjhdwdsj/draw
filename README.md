# 实况足球手机版 - 球员抽卡模拟器

**PES Mobile Card Gacha Simulator**

## 项目简介

这是一个基于网页的「实况足球手机版（eFootball Mobile）」球员抽卡模拟器，完整复刻了游戏内的抽卡系统，支持多种卡池、动画特效、球员库存管理及解约换卷等功能。

## 文件结构

| 文件 | 说明 |
|------|------|
| `index.html` | 主页面，包含全部 UI、CSS 样式与内联 JavaScript 逻辑 （约 3985 行） |
| `card-system.js` | 独立的抽卡系统 JS 类（`PESCardSystem`），可复用于其他项目 |
| `players_data_complete.json` | 球员数据库，包含卡池配置与球员属性（77 名球员） |
| `tools/player-import.html` | 球员数据管理工具，可视化表单帮助从数据网站导入新球员 |
| `server.js` | Node.js REST API 服务器（无需安装依赖，仅本地开发使用） |
| `package.json` | 项目元数据与 `npm start` 启动脚本 |
| `bgm/` | 背景音乐文件夹（24 首 BGM） |
| `鼓掌欢呼声音效.mp3` | 抽卡成功时的欢呼音效 |

## 功能特性

### 卡池系统
- **高光定向卷池**：消耗定向高光卷，100% 获得高光球员
- **精选定向卷池**：消耗定向精选卷，100% 获得精选球员
- **高光卷池**：消耗高光卷，10% 概率获得高光球员
- **精选卷池**：消耗精选卷，4% 概率获得精选球员；250 张卷保底 10-12 个精选

### 球员稀有度
`普卡` → `精选` → `梦幻精选` → `高光` → `传奇高光`

### 其他功能
- 抽卡动画（球场 + 烟花特效）
- 球员卡牌翻转展示
- 背景音乐随机播放
- 球员库存管理与筛选
- 球员解约换卷系统
- 保底计数器
- 货币系统（高光卷 / 精选卷 / 定向卷等）
- 充值模拟弹窗
- 移动端横屏适配

## 运行方式

### 方式一：带 REST API 的 Node.js 服务器（推荐）

```bash
node server.js
# 或
npm start
# 然后访问 http://localhost:3000
```

### 方式二：纯静态文件（仅前端）

```bash
# Python 3
python -m http.server 8080
# 然后访问 http://localhost:8080
```

## 球员数据 REST API

服务器启动后（默认端口 `3000`），可通过以下接口获取与更新球员数据：

| 方法 | 路径 | 说明 |
|------|------|------|
| `GET` | `/api/players` | 获取所有球员列表 |
| `GET` | `/api/players/:index` | 获取指定索引的球员 |
| `POST` | `/api/players` | 新增球员 |
| `PUT` | `/api/players/:index` | 更新指定球员（部分更新，仅传需修改的字段） |
| `DELETE` | `/api/players/:index` | 删除指定球员 |

所有接口返回 JSON，响应头包含 CORS 支持，可跨域访问。

### 示例

```bash
# 获取所有球员
curl http://localhost:3000/api/players

# 获取第 0 名球员（梅西）
curl http://localhost:3000/api/players/0

# 新增球员
curl -X POST http://localhost:3000/api/players \
  -H 'Content-Type: application/json' \
  -d '{"姓名":"新球员","稀有度":"精选","总评":90,"位置":"CF","国籍":"中国","俱乐部":"示例队","能力值":{"进攻":90,"防守":40,"身体":80,"速度":85,"传球":75,"运球":82}}'

# 更新第 0 名球员的总评
curl -X PUT http://localhost:3000/api/players/0 \
  -H 'Content-Type: application/json' \
  -d '{"总评":99}'

# 删除最后一名球员（假设共 47 名，索引为 46）
curl -X DELETE http://localhost:3000/api/players/46
```

## 球员数据来源

本项目的球员数据可从以下网站获取，然后通过 `tools/player-import.html` 整理导入：

| 网站 | 链接 | 说明 |
|------|------|------|
| **PESMaster** | https://www.pesmaster.com/efootball-2024/efootball/ | 最全面的 eFootball 球员数据库，含总评、位置、技能，**推荐首选** |
| **PES Database** | https://pesdb.net/efootball/ | 支持按位置/联赛筛选，可批量查看球员评分 |
| **SoFIFA** | https://sofifa.com/players | EA Sports FC / FIFA 数据，能力值结构与本项目类似，可作参考 |
| **eFootballHub** | https://efootballhub.net/players | 专注 eFootball 手游的卡包与技能数据 |
| **游民星空** | https://gl.gamersky.com/handbook/efootball/ | 中文实况足球攻略站，有球员评分与技能中文名称 |
| **Bilibili 整理帖** | https://search.bilibili.com/all?keyword=实况足球球员数据 | B站玩家整理的中文版数据帖，适合手游卡池参考 |

### 数据导入工具

打开 `tools/player-import.html`（双击或用浏览器打开）即可使用可视化表单：
1. 在上方网站查找球员数据
2. 填写表单（姓名、稀有度、总评、能力值、技能等）
3. 批量导出 JSON，粘贴到 `players_data_complete.json` 的 `球员` 数组末尾

## 技术栈

- 纯 HTML5 + CSS3 + 原生 JavaScript（无框架依赖）
- 响应式布局，针对移动端横屏优化
- Web Audio API 用于音效播放
- CSS 动画与 `@keyframes` 实现抽卡特效
- Node.js 内置模块（`http`、`fs`、`path`）实现 REST API 服务器，**无需安装任何 npm 依赖**

## 数据说明

`players_data_complete.json` 包含：
- **卡池系统**：4 种卡池的消耗规则与概率配置
- **解约奖励**：不同稀有度球员解约后返还的卷数
- **球员**：77 名球员数据，涵盖梅西、C罗、姆巴佩等世界顶级球星及中超球员，每位球员包含总评、位置、国籍、俱乐部、六维能力值及特殊技能
