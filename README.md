# StarryMuse Box 🌟

> An interactive idol simulation game built with React.
> 一款基于 React 构建的偶像箱庭模拟游戏。

---

## 📌 About / 关于本项目

This is a **concept prototype / MVP** for an AI-powered idol simulation experience.  
It explores core interaction patterns including character dialogue, daily scheduling, item collection, and a personal diary system.

这是一个 **概念原型 / MVP**，用于探索 AI 驱动的偶像模拟互动体验。  
核心交互包括角色对话、每日日程、道具收集与日记系统，旨在验证产品创意的可行性。

---

## ⚡ Quick Start / 快速启动

```bash
git clone https://github.com/KIWI0912/starrymuse-box.git && cd starrymuse-box && npm install && npm run dev
```

---

## 🧪 Testing / 本地测试步骤

**环境要求 Prerequisites：**
- Node.js >= 18
- npm >= 8

```bash
# 1. 克隆项目 Clone the repo
git clone https://github.com/KIWI0912/starrymuse-box.git

# 2. 进入目录 Enter the folder
cd starrymuse-box

# 3. 安装依赖 Install dependencies
npm install

# 4. 启动开发服务器 Start dev server
npm run dev
```

启动后打开浏览器访问 Open in browser：
```
http://localhost:5173
```

---

## 💬 Chat Trigger Guide / 对话触发指南

游戏中共有 **5 位角色**，每位角色会根据你发送的关键词给出不同回复，并有概率触发专属道具。

### 角色一览

| 角色 | 身份 | 对话风格 |
|------|------|---------|
| 季言 | 同期练习生 | 温柔、克制、慢热 |
| Mia | 训练负责人 | 严格、理性、可靠 |
| 阿澈 | 核心粉丝 | 热烈、话多、真诚 |
| Luna | 数据运营 | 冷静、分析型、策略性 |
| Noah | 经纪人 | 商务、克制、观察型 |

---

### 🔑 关键词触发规则

发送消息时，系统会自动检测以下关键词并触发对应反应：

#### 😰 紧张 / 舞台焦虑
触发词：`紧张` `害怕` `首秀` `舞台`

| 角色 | 回复风格 | 可能触发道具 |
|------|---------|------------|
| 季言 | 陪伴型，不强迫你振作 | ⭐ 折好的纸星星 |
| Mia | 拆解流程，把焦虑变成可执行步骤 | 📋 首秀流程卡 |
| 阿澈 | 告诉你台下有人在看你 | ✨ 手写应援灯牌 |
| Luna | 用数据说明紧张是正常的 | 📊 首秀反馈预测表 |
| Noah | 关注你是否有「被记住的瞬间」 | 🎫 新人舞台通行证 |

#### 😴 疲惫 / 体力不足
触发词：`累` `好累` `疲惫` `没力气` `撑不住`

| 角色 | 回复风格 | 可能触发道具 |
|------|---------|------------|
| 季言 | 不催你，只是陪着 | 🍯 温热蜂蜜水 |
| Mia | 直接调整日程，强制你休息 | 🛌 强制休息许可 |
| 阿澈 | 心疼你，发粉丝群晚安截图 | 🌙 粉丝群晚安截图 |
| Luna | 用数据证明休息有意义 | 📈 恢复曲线图 |
| Noah | 提醒你过度消耗影响判断力 | 🕰️ 延后评估申请 |

#### 😢 难过 / 情绪低落
触发词：`不够好` `难过` `焦虑` `低落` `很难受` `心情不好`

| 角色 | 回复风格 | 可能触发道具 |
|------|---------|------------|
| 季言 | 陪你待过这段难过 | 📝 没写完的便签 |
| Mia | 把坏情绪拆成可解决的清单 | ✅ 问题拆解清单 |
| 阿澈 | 发来一百条加油弹幕 | 💬 一百条加油弹幕 |
| Luna | 过滤负面反馈，只留有价值的 | 🧩 负面反馈过滤器 |
| Noah | 告诉你市场看的是成长曲线 | 📂 成长曲线档案 |

#### 😊 开心 / 表现好
触发词：`开心` `不错` `成功` `高兴` `表现好`

| 角色 | 回复风格 | 可能触发道具 |
|------|---------|------------|
| 季言 | 悄悄记录你开心的样子 | 📷 小小拍立得 |
| Mia | 复盘今天做对的部分 | 📑 训练复盘表 |
| 阿澈 | 比你还夸张地庆祝 | 🎉 庆祝头像框 |
| Luna | 建议你保留今天的表达方式 | 🎞️ 高光片段分析 |
| Noah | 告诉你稳定表现提升合作方信任 | 🤝 合作意向便签 |

#### 💭 其他特殊触发

| 输入内容 | 触发条件 | 效果 |
|---------|---------|------|
| `喜欢我` / `爱我` / `在意我` | 任意角色 | 根据关系阶段和角色性格给出不同回应，不会触发道具 |
| `散步` / `出去走走` | 任意角色 | 各角色给出不同态度的回应 |
| `爬山` / `远足` | 任意角色 | 各角色根据性格劝阻或回应 |

---

### 🎁 道具触发机制说明

- 道具触发有 **60% 的随机概率**（不是每次都会触发）
- 同一道具只会触发 **一次**，进入背包后不会重复获得
- 触发道具后，对应数值会自动变化（心情、体力、羁绊值等）

---

### 📊 数值说明

| 数值 | 说明 |
|------|------|
| 人气 Popularity | 影响解锁演出、综艺等资源机会 |
| 心情 Mood | 影响对话走向和状态描述 |
| 体力 Stamina | 影响训练选择和恢复速度 |
| 魅力 Charm | 影响舞台感和 MV 拍摄机会 |
| 羁绊 Bond | 全局好感度，影响特别剧情解锁 |

---

## 🗓️ Schedule System / 日程系统

每天有 4 个时间段可以选择活动：

| 时间 | 活动 | 可邀请角色 |
|------|------|-----------|
| 14:00 | 🎤 声乐练习 | Mia / 季言 |
| 16:30 | 🩰 体能训练 | Mia |
| 20:00 | 🌙 傍晚散步 | 季言 / 阿澈 |
| 22:30 | 📓 睡前整理 | Luna |

每个活动都有多种选择，影响不同数值。

---

## 🚀 One-Click Deploy / 一键部署

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/KIWI0912/starrymuse-box)

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/KIWI0912/starrymuse-box)

---

## Features / 功能特色

- 💬 Character chat system with keyword-based responses / 关键词驱动的角色对话系统
- 📅 Daily schedule & activity choices / 每日日程与活动选择
- 🎁 Item collection triggered by emotional context / 情绪感知道具触发与背包系统
- 📖 Diary system / 日记系统
- 📱 Mobile-style UI / 手机风格界面

---

## Tech Stack / 技术栈

- React
- Vite
- CSS

---

## Live Demo / 在线体验

> Coming soon / 即将上线

---

## License / 许可证

MIT © KIWI0912
