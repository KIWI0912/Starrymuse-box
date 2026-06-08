import { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";

const zeroStats = { popularity: 0, mood: 50, stamina: 50, charm: 0, bond: 0 };

const idolProfiles = [
  { id: "sweet",   name: "元气甜心",  title: "出道前 7 日 · 高互动新人偶像", emoji: "🎀",
    desc: "总是用笑容掩饰紧张，擅长和观众互动，是最容易被粉丝记住的类型。",
    tags: ["甜感","互动","亲和力"] },
  { id: "cool",    name: "清冷实力派", title: "出道前 7 日 · 反差型舞台新人",  emoji: "🦋",
    desc: "平时话不多，但站上舞台时会展现完全不同的一面，适合实力成长路线。",
    tags: ["实力","清冷","反差"] },
  { id: "healing", name: "治愈系主唱", title: "出道前 7 日 · 温柔叙事型新人",  emoji: "🌙",
    desc: "拥有柔和的声线，适合情感陪伴、深夜剧情和高羁绊路线。",
    tags: ["主唱","治愈","温柔"] },
];

// location 字段全部移除，角色不绑定固定地点
const characters = [
  {
    id: "jiyan", name: "季言", role: "同期练习生", avatar: "💫",
    relationName: "羁绊", relationshipMode: "slow-romance",
    intro: "总是安静地等着，像是只为你亮起的一盏灯。",
    opening: "刚看到你的练习打卡，这个时间还在线，是又多练了一会儿吗？",
  },
  {
    id: "mia", name: "Mia", role: "训练负责人", avatar: "📋",
    relationName: "信任", relationshipMode: "professional",
    intro: "负责你的训练、日程和状态管理，严格但可靠。",
    opening: "系统记录显示你比计划晚了三分钟。我已经重新调整了今晚的训练安排。现在还能集中注意力吗？",
  },
  {
    id: "chen", name: "阿澈", role: "核心粉丝", avatar: "🌟",
    relationName: "热度", relationshipMode: "fan-support",
    intro: "你的第一批粉丝之一，总是热烈回应你的每一次登场。",
    opening: "你上线啦！我刚刚还在看你的练习片段。虽然只是很短的一段，但我觉得你比昨天更稳了一点。",
  },
  {
    id: "luna", name: "Luna", role: "数据运营", avatar: "📊",
    relationName: "默契", relationshipMode: "strategic",
    intro: "分析人气、互动率和粉丝偏好，帮助你找到成长策略。",
    opening: "我刚看完你最近的数据。你的情绪类反馈比技巧类反馈更高，说明观众更愿意看见真实的你。",
  },
  {
    id: "noah", name: "Noah", role: "经纪人", avatar: "🤝",
    relationName: "资源", relationshipMode: "business",
    intro: "负责商业邀约和舞台资源，有时会带来新的剧情机会。",
    opening: "晚上好。我把一个新人联合舞台的邀约转给你了。是否推进，要看你接下来的状态。",
  },
];

// 初始心情选项（进入游戏时玩家自选）
const moodOptions = [
  { label: "状态不错 ✨", mood: 80, stamina: 70 },
  { label: "还好，普通的一天", mood: 55, stamina: 55 },
  { label: "有点累了", mood: 40, stamina: 30 },
  { label: "心情不太好", mood: 25, stamina: 50 },
  { label: "很难受，撑着呢", mood: 15, stamina: 20 },
];
const itemMap = {
  jiyan: {
    nervous: { id:"jiyan-paper-star",       name:"折好的纸星星",   emoji:"⭐",  type:"同城跑腿",     message:"我叫了个跑腿给你送了个东西，不贵，紧张的时候拿在手里就好。",          flavor:"它很轻，却像替你装住了一点不敢说出口的紧张。",         effect:{ mood:2, bond:1, relation:1 } },
    tired:   { id:"jiyan-honey-water",      name:"温热蜂蜜水",     emoji:"🍯",  type:"外卖订单",     message:"我给你点了杯蜂蜜水，备注写了少冰。到了记得拿一下。",                  flavor:"没有催你振作，只是等你慢慢把它喝完。",                 effect:{ mood:1, stamina:2, bond:1, relation:1 } },
    sad:     { id:"jiyan-unfinished-note",  name:"没写完的便签",   emoji:"📝",  type:"图片消息",     message:"本来想写完再给你看，但想了想，现在发给你也可以。",                    flavor:"你看不出他删掉了什么，却看得出他认真想安慰你。",       effect:{ mood:2, bond:1, relation:1 } },
    happy:   { id:"jiyan-polaroid",         name:"小小拍立得",     emoji:"📷",  type:"快递寄送",     message:"那张照片我洗出来了，实体版明天到，电子版先发你。",                    flavor:"说拍糊了要删掉，却还是偷偷留了一张给你。",             effect:{ popularity:1, mood:1, charm:1, bond:1, relation:1 } },
  },
  mia: {
    nervous: { id:"mia-debut-card",         name:"首秀流程卡",     emoji:"📋",  type:"工作台文件",   message:"流程卡已经同步到你的训练工作台了，按顺序看，不要跳读。",                flavor:"没有说别紧张，只是把未知拆成了可以执行的一步一步。",   effect:{ mood:1, charm:1, relation:1 } },
    tired:   { id:"mia-rest-permit",        name:"强制休息许可",   emoji:"🛌",  type:"日程调整",     message:"我已经把今晚最后一组训练从日程里移除了。现在休息。",                  flavor:"不是纵容，是替你守住明天状态的方式。",                 effect:{ mood:1, stamina:3, relation:1 } },
    sad:     { id:"mia-breakdown-list",     name:"问题拆解清单",   emoji:"✅",  type:"任务清单",     message:"清单发你了，里面只有三件事，今晚只处理第一件就好。",                  flavor:"坏情绪没有被否定，只是被放进了可以解决的格子里。",     effect:{ mood:1, charm:1, relation:1 } },
    happy:   { id:"mia-review-sheet",       name:"训练复盘表",     emoji:"📑",  type:"复盘报告",     message:"今天的表现值得记录。复盘表已经更新，你有进步，而且不是偶然。",          flavor:"夸奖仍然克制，但红笔停留的地方比平时多了一点。",       effect:{ popularity:1, charm:2, relation:1 } },
  },
  chen: {
    nervous: { id:"chen-light-board",       name:"手写应援灯牌",   emoji:"✨",  type:"粉丝群图片",   message:"我们做了灯牌！字有点歪，但真的很亮，你上台一定看得到。",                flavor:"你忽然意识到，台下真的会有人寻找你的方向。",           effect:{ popularity:2, mood:2, bond:1, relation:1 } },
    tired:   { id:"chen-goodnight-shot",    name:"粉丝群晚安截图", emoji:"🌙",  type:"群聊截图",     message:"大家都说让你早点休息，我把截图发你了，你不用回，看一眼就好。",          flavor:"热闹隔着屏幕传过来，反而让夜晚变得柔软了一点。",       effect:{ mood:1, stamina:1, bond:1, relation:1 } },
    sad:     { id:"chen-cheer-barrage",     name:"一百条加油弹幕", emoji:"💬",  type:"直播弹幕合集", message:"我把大家的加油弹幕都截下来了，你想看的时候点开就好。",                flavor:"有点吵，却像很多人一起替你挡住了坏情绪。",             effect:{ popularity:1, mood:2, bond:1, relation:1 } },
    happy:   { id:"chen-avatar-frame",      name:"庆祝头像框",     emoji:"🎉",  type:"直播礼物",     message:"粉丝群刚刚在直播间给你刷了一波小星星！大家把头像框也换成你的应援色了！",flavor:"庆祝得比你还夸张，好像你的进步也是他们的节日。",       effect:{ popularity:2, mood:1, charm:1, bond:1, relation:1 } },
  },
  luna: {
    nervous: { id:"luna-feedback-forecast", name:"首秀反馈预测表", emoji:"📊",  type:"数据报告",     message:"预测报告发你了，不是为了增加压力，是让未知变得可读一点。",              flavor:"没有消除紧张，却让未知显得没那么巨大。",               effect:{ popularity:1, mood:1, charm:1, relation:1 } },
    tired:   { id:"luna-recovery-curve",    name:"恢复曲线图",     emoji:"📈",  type:"数据图表",     message:"数据支持你现在休息，继续练下去，明天的表现会被拖低。",                flavor:"理性有时候不是冰冷，而是替你证明休息也有意义。",       effect:{ mood:1, stamina:2, relation:1 } },
    sad:     { id:"luna-negative-filter",   name:"负面反馈过滤器", emoji:"🧩",  type:"舆情过滤",     message:"我过滤了一遍，真正有参考价值的只有三条，其他不用看。",                flavor:"你第一次觉得，那些刺耳的话也许没有你想象中那么重。",   effect:{ mood:2, charm:1, relation:1 } },
    happy:   { id:"luna-highlight-analysis",name:"高光片段分析",   emoji:"🎞️", type:"高光剪辑",     message:"高光片段已经剪出来了，建议明早发布，互动率会更好。",                  flavor:"原来你以为普通的一瞬间，也被很多人停下来认真看过。",   effect:{ popularity:2, charm:1, relation:1 } },
  },
  noah: {
    nervous: { id:"noah-stage-pass",        name:"新人舞台通行证", emoji:"🎫",  type:"电子通行证",   message:"电子通行证已经发到你邮箱了，明天是否使用，看你的状态。",                flavor:"不是安慰，而是一种观察：他认为你值得被放到灯下看看。", effect:{ popularity:1, charm:2, relation:1 } },
    tired:   { id:"noah-delay-request",     name:"延后评估申请",   emoji:"🕰️", type:"商务邮件",     message:"我把评估延期邮件抄送给你了，今晚不用再处理这件事。",                  flavor:"没有显得温柔，但这个决定确实替你留出了恢复空间。",     effect:{ mood:1, stamina:2, relation:1 } },
    sad:     { id:"noah-growth-file",       name:"成长曲线档案",   emoji:"📂",  type:"商务评估文档", message:"这份档案记录的不是你最好的表现，而是你一直在变好的证据。",              flavor:"商业判断不等于冷漠，有时候它也会认真看见你的努力。",   effect:{ popularity:1, mood:1, charm:1, relation:1 } },
    happy:   { id:"noah-collab-note",       name:"合作意向便签",   emoji:"🤝",  type:"品牌寄送",     message:"品牌方寄了一份样品礼盒给你，不用急着营业，先试试看合不合适。",          flavor:"不是承诺，但说明今天的你让机会靠近了一点。",           effect:{ popularity:2, charm:2, relation:1 } },
  },
};

const scheduleEvents = [
  {
    id: "vocal-practice",
    time: "14:00", icon: "🎤", title: "声乐练习",
    desc: "今天的声乐课可以自己练，也可以找人陪着。",
    choices: [
      { id: "vocal-solo",  label: "独自练习",    desc: "一个人待着，反而更容易进入状态。",         characterId: null,    effect: { charm: 1, stamina: -1 },             result: `你把同一句歌词唱了十几遍。没有人听，但你知道今天比昨天稳了一点。` },
      { id: "vocal-mia",   label: "邀请 Mia",    desc: "让她帮你调整训练节奏。",                   characterId: "mia",   effect: { charm: 1, stamina: 1, relation: 1 }, result: `Mia 听完了整段练习。她只说"比昨天稳定"，但你知道这已经是她少见的认可。` },
      { id: "vocal-jiyan", label: "邀请季言",    desc: "他不是声乐老师，但他会听。",               characterId: "jiyan", effect: { mood: 2, relation: 2 },              result: `季言没有打断你。你唱完时，他才说："刚才那一句，很像你。"` },
      { id: "vocal-skip",  label: "今天跳过",    desc: "状态不对，强迫自己练也没用。",             characterId: null,    effect: { stamina: 1 },                        result: `你没有打开练习软件。有一点愧疚，但今晚或许真的不是时候。` },
    ],
  },
  {
    id: "stamina-training",
    time: "16:30", icon: "🩰", title: "体能训练",
    desc: "今天的体能课可以按计划走，也可以调整强度。",
    choices: [
      { id: "stamina-full", label: "全力完成",            desc: "按原计划，不减量。",               characterId: null,  effect: { stamina: -2, charm: 2 },             result: `你撑下来了。腿很酸，但你知道今天的量没有白费。` },
      { id: "stamina-mia",  label: "让 Mia 帮你调整计划", desc: "她会根据你的状态重新安排。",       characterId: "mia", effect: { stamina: 1, charm: 1, relation: 1 }, result: `Mia 把训练量压得很准。你累了，但没有被消耗到崩溃。` },
      { id: "stamina-rest", label: "今天减量",            desc: "状态不好的时候，休息也是选择。",   characterId: null,  effect: { stamina: 2, mood: 1 },               result: `你提前结束了训练。有一点愧疚，但身体明显轻了。` },
      { id: "stamina-skip", label: "今天跳过",            desc: "完全跳过，先照顾好自己。",         characterId: null,  effect: { stamina: 3 },                        result: `你没有去训练室。身体谢谢你今天的决定。` },
    ],
  },
  {
    id: "evening-walk",
    time: "20:00", icon: "🌙", title: "傍晚散步",
    desc: "训练结束后，有一段空白时间。你可以自己走走，也可以约人。",
    choices: [
      { id: "walk-solo",  label: "独自出门",   desc: "不想说话，只是想动一动。",                       characterId: null,    effect: { mood: 2 },              result: `你走了大概二十分钟。什么都没想，但回来时感觉好了一点。` },
      { id: "walk-jiyan", label: "约季言一起", desc: "他应该也在，问问他有没有空。",                   characterId: "jiyan", effect: { mood: 2, relation: 2 }, result: `季言走得很慢。你们没有说太多话，但他一直把外侧的位置让给你。` },
      { id: "walk-chen",  label: "约阿澈一起", desc: "她肯定会一路说个不停，今晚或许刚好需要这个。",   characterId: "chen",  effect: { mood: 3, relation: 1 }, result: `阿澈从便利店一路说到公园。你没怎么说话，但笑了好几次。` },
      { id: "walk-skip",  label: "今天不出门", desc: "就待在房间里，也挺好的。",                       characterId: null,    effect: { stamina: 1 },          result: `你没有出门。窗外的声音隔着玻璃传进来，反而让房间显得安静了。` },
    ],
  },
  {
    id: "night-reflection",
    time: "22:30", icon: "📓", title: "睡前整理",
    desc: "今天结束前，花一点时间整理一下自己。",
    choices: [
      { id: "reflect-write", label: "写下今天",     desc: "把今天发生的事记下来，哪怕只是一句话。", characterId: null,   effect: { mood: 1, charm: 1 },              result: `你写了几行字。不知道算不算有意义，但写完感觉今天变得更真实了。` },
      { id: "reflect-luna",  label: "和 Luna 聊聊", desc: "她会帮你梳理今天的状态。",               characterId: "luna", effect: { mood: 1, charm: 1, relation: 1 }, result: `Luna 把今天的关键节点都梳理了一遍。你不确定这算安慰还是分析，但睡前脑子清楚了很多。` },
      { id: "reflect-sleep", label: "直接睡",       desc: "今天已经够了，不需要再想了。",           characterId: null,   effect: { stamina: 2 },                     result: `你关了灯。什么都没整理，但你知道明天还会来。` },
      //{ id: "reflect-skip",  label: "今天跳过",     desc: "不想整理，就这样结束也可以。",           characterId: null,   effect: {},                                 result: `今天就这样过去了。没有总结，没有记录，但它确实发生过。` },
    ],
  },
];

const rechargePlans = [
  { id:"small",  name:"星钻小袋", amount:60,  price:"HK$ 8",  desc:"补充少量星钻。" },
  { id:"medium", name:"星钻礼盒", amount:300, price:"HK$ 38", desc:"适合后续剧情或装扮内容。" },
  { id:"large",  name:"星钻月契", amount:980, price:"HK$ 98", desc:"当前仅作为 Demo 展示入口。" },
];

// ── 工具函数 ──────────────────────────────────────────────────────

function getMoodHint(v) {
  if (v >= 75) return "心情很好";
  if (v >= 55) return "状态还算平稳";
  if (v >= 35) return "有些不安";
  if (v >= 15) return "情绪有点低落";
  return "很难受";
}

function getStaminaHint(v) {
  if (v >= 75) return "体力充足";
  if (v >= 50) return "还能坚持";
  if (v >= 25) return "有些疲惫";
  return "需要好好休息";
}

function getCharmHint(v) {
  if (v >= 70) return "舞台感越来越强";
  if (v >= 40) return "表现越来越自然";
  if (v >= 15) return "开始找到感觉";
  return "仍在摸索";
}

function getRelationStage(v) {
  if (v < 5)  return "初识";
  if (v < 12) return "熟悉";
  if (v < 24) return "信任";
  if (v < 40) return "亲近";
  return "深层羁绊";
}

// 实时时间
function getCurrentTime() {
  const n = new Date();
  return `${String(n.getHours()).padStart(2,"0")}:${String(n.getMinutes()).padStart(2,"0")}`;
}

// 实时时钟 hook
function useClock() {
  const [time, setTime] = useState(getCurrentTime());
  useEffect(() => {
    const t = setInterval(() => setTime(getCurrentTime()), 10000);
    return () => clearInterval(t);
  }, []);
  return time;
}

function getUnlockedFeatures(stats, relations) {
  const features = [];
  const sorted   = Object.entries(relations).sort((a, b) => b[1] - a[1]);
  const topId    = sorted[0]?.[0];
  const topVal   = sorted[0]?.[1] || 0;
  const topChar  = characters.find((c) => c.id === topId);
  if (stats.popularity >= 15) features.push({ icon: "🎪", label: "小型演出邀约",       desc: "有人注意到你了，第一个演出机会出现了。" });
  if (stats.popularity >= 35) features.push({ icon: "📺", label: "综艺录制邀请",       desc: "你的讨论度引起了节目组的注意。" });
  if (stats.charm >= 30)      features.push({ icon: "🎬", label: "MV 拍摄机会",        desc: "舞台感已经足够支撑一次正式拍摄。" });
  if (topVal >= 12 && topChar) features.push({ icon: "🌟", label: `与${topChar.name}的特别剧情`, desc: "你们之间的关系已经到了新的阶段。" });
  if (stats.stamina >= 50 && stats.charm >= 25) features.push({ icon: "🏟️", label: "联合舞台资格", desc: "状态和舞台感都达到了参与联合演出的门槛。" });
  return features;
}

function detectItemType(text) {
  if (text.includes("紧张")||text.includes("害怕")||text.includes("首秀")||text.includes("舞台")) return "nervous";
  if (text.includes("累")  ||text.includes("疲惫")||text.includes("好累")||text.includes("没力气")||text.includes("撑不住")) return "tired";
  if (text.includes("不够好")||text.includes("难过")||text.includes("焦虑")||text.includes("低落")||text.includes("很难受")||text.includes("心情不好")) return "sad";
  if (text.includes("开心")||text.includes("不错")||text.includes("成功")||text.includes("表现好")||text.includes("高兴")) return "happy";
  return null;
}

// 对话关键词 → 直接影响状态数值
function getMoodEffectFromText(text) {
  const type = detectItemType(text);
  if (type === "tired")   return { stamina: -5, mood: -3 };
  if (type === "sad")     return { mood: -6 };
  if (type === "nervous") return { mood: -3 };
  if (type === "happy")   return { mood: 5, popularity: 1 };
  return null;
}

function detectItem(text, characterId, inventory) {
  const itemType = detectItemType(text);
  if (!itemType || !characterId) return null;
  const candidate = itemMap[characterId]?.[itemType];
  if (!candidate) return null;
  if (inventory.some((i) => i.id === candidate.id)) return null;
  if (Math.random() > 0.4) return null;
  return candidate;
}

function getSilentEffect(text) {
  const type = detectItemType(text);
  if (type === "nervous") return { mood: 1, relation: 1 };
  if (type === "tired")   return { stamina: 1, relation: 1 };
  if (type === "sad")     return { mood: 1, relation: 1 };
  if (type === "happy")   return { popularity: 1, charm: 1, relation: 1 };
  return { relation: 1 };
}

function createInitialRelations() {
  const r = {};
  characters.forEach((c) => { r[c.id] = 0; });
  return r;
}

function createInitialChatHistories() {
  const h = {};
  characters.forEach((c) => {
    h[c.id] = [{ id: `${c.id}-opening`, sender: "ai", text: c.opening, time: getCurrentTime(), complete: true }];
  });
  return h;
}

function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
// ── generateReply ─────────────────────────────────────────────────

function generateReply(text, character, relationValue) {
  if (!character) return `我在。你可以慢慢说。`;
  const stage = getRelationStage(relationValue || 0);
  const askingLove = text.includes("喜欢我")||text.includes("爱我")||text.includes("在意我")||text.includes("你是不是喜欢");
  const mountain   = text.includes("爬山")||text.includes("远足")||text.includes("爬坡");
  const walk       = text.includes("散步")||text.includes("出去走走")||text.includes("走一走");

  if (askingLove) {
    if (character.relationshipMode === "professional")  return `如果你指的是职业关注，那是。如果你指的是别的，我建议你先完成今晚的训练。`;
    if (character.relationshipMode === "fan-support")   return `我当然很喜欢你啊……但那是粉丝想看你发光的喜欢。你不用把它变成压力。`;
    if (character.relationshipMode === "strategic")     return `这个问题不在我的数据模型里。但如果你问信任程度，我确实比以前更愿意参考你的直觉。`;
    if (character.relationshipMode === "business")      return `我欣赏你的潜力，但欣赏和私人感情是两件事。现在谈这个，对你不公平。`;
    if (stage === "初识" || stage === "熟悉")           return `你现在应该先想首秀。`;
    if (stage === "信任")                               return `如果我说我很在意，你会不会反而更紧张？`;
    return `我不想在你还没站稳的时候，把我的心情也交给你背着。`;
  }
  if (mountain) {
    if (character.id === "jiyan") return `爬山吗……如果是你的话，我当然想陪你。只是我可能走不了太久，如果你不介意慢一点，我们可以选一条不太陡的路。`;
    if (character.id === "mia")   return `如果你指的是体能训练，我建议先做基础耐力评估。临时爬山不是合理安排。`;
    if (character.id === "chen")  return `爬山听起来好青春！但你明天还有训练吧？要不要换成轻松一点的散步？`;
    if (character.id === "luna")  return `以你当前状态，爬山的恢复成本偏高，不建议作为今晚事件。`;
    return `如果它会影响明天状态，我不建议你现在做这个决定。`;
  }
  if (walk) {
    if (character.id === "jiyan") return stage === "初识" ? `可以。只是如果你觉得不自在，我们就走短一点。` : `夜里冷，多带件外套。`;
    if (character.id === "mia")   return `十五分钟。散步可以，但不能拖到影响睡眠。`;
    if (character.id === "chen")  return `散步好啊！我可以一路给你讲今天粉丝群里发生的好笑事情！`;
    if (character.id === "luna")  return `低强度移动有助于情绪回落，可以执行。`;
    return `如果只是短时间调整状态，我没有意见。`;
  }
  if (text.includes("紧张")||text.includes("害怕")||text.includes("首秀")||text.includes("舞台")) {
    if (character.id === "mia")  return `紧张不是错误。现在先把注意力放回流程：开场站位、第一句歌词、呼吸节奏。你不需要一次解决所有问题。`;
    if (character.id === "chen") return `你一上台我肯定会在台下看着。就算声音发抖也没关系，那也是你第一次真的站到光里。`;
    if (character.id === "luna") return `观众对新人首秀里的真实紧张感并不排斥。你不必把它完全藏起来，它可能会成为记忆点。`;
    if (character.id === "noah") return `首秀会影响后续资源判断，但不是只看完美度。我更想看见你是否有让人记住的瞬间。`;
    return `紧张说明你真的很在意。你不需要完美地走上去，只要别把自己丢在台下。`;
  }
  if (text.includes("累")||text.includes("好累")||text.includes("疲惫")||text.includes("没力气")||text.includes("撑不住")) {
    if (character.id === "mia")  return `今天训练量已经偏高。你现在需要的不是继续证明自己，而是把状态留到明天。`;
    if (character.id === "chen") return `辛苦了。粉丝不是只喜欢你发光的时候，也会心疼你撑不住的时候。`;
    if (character.id === "luna") return `体力下降会直接影响镜头表现，建议今晚的目标从"继续练"改成"恢复"。`;
    if (character.id === "noah") return `过度消耗会影响明天判断，适当休息也是职业选择的一部分。`;
    return `别逞强。你可以累，也可以停下来。偶像不是不能有喘不过气的时候。`;
  }
  if (text.includes("不够好")||text.includes("难过")||text.includes("焦虑")||text.includes("低落")||text.includes("很难受")||text.includes("心情不好")) {
    if (character.id === "mia")  return `不要用"不够好"定义自己。你只是还没有把问题拆成可执行项，先从能解决的一小部分开始。`;
    if (character.id === "chen") return `你可能看不到自己发光的样子，但我们看得到。你不用今天就变成最好的样子。`;
    if (character.id === "luna") return `负面反馈会被你放大。数据上看，你并没有像你以为的那样被否定。`;
    if (character.id === "noah") return `新人阶段不稳定很正常，市场更在意成长曲线，不是单次表现。`;
    return `那今晚就先不要变好。先让我陪你把这段难过待过去。`;
  }
  if (text.includes("开心")||text.includes("不错")||text.includes("成功")||text.includes("高兴")||text.includes("表现好")) {
    if (character.id === "mia")  return `很好。这说明训练反馈开始转化成舞台表现，记住今天做对的部分，下次复用。`;
    if (character.id === "chen") return `我就知道你可以！不是那种夸张的客套，是我真的觉得你比昨天更像舞台上的人了。`;
    if (character.id === "luna") return `正向反馈明显提升，建议你保留今天的表达方式，它对观众有效。`;
    if (character.id === "noah") return `不错。稳定表现会提高合作方对你的信任度。`;
    return `你刚才说开心的时候，语气都不一样了。`;
  }
  if (character.id === "mia")  return `我记录下来了。你可以继续说具体一点，我会帮你判断接下来是训练、休息，还是调整节奏。`;
  if (character.id === "chen") return `嗯嗯，我在听。就算只是很小的一件事，我也想知道，因为那也是你今天的一部分。`;
  if (character.id === "luna") return `这条信息我会归入你的状态记录，它可能会影响今晚事件的走向。`;
  if (character.id === "noah") return `我明白。这个选择可能会影响你后续的资源路线，但现在还不需要急着下结论。`;
  return `我在。你慢慢说就好。`;
}

// ── App 主组件 ────────────────────────────────────────────────────

function App() {
  const pageContentRef = useRef(null);
  const chatListRef    = useRef(null);
  const clock          = useClock();

  const [hasEnteredApp,     setHasEnteredApp]     = useState(false);
  const [profile,           setProfile]           = useState(null);
  const [stats,             setStats]             = useState(null);
  const [moodPicked,        setMoodPicked]        = useState(false);
  const [diamonds,          setDiamonds]          = useState(0);
  const [activeTab,         setActiveTab]         = useState("home");
  const [flowStep,          setFlowStep]          = useState(null);
  const [activeCharacterId, setActiveCharacterId] = useState(null);
  const [relations,         setRelations]         = useState(() => createInitialRelations());
  const [chatHistories,     setChatHistories]     = useState(() => createInitialChatHistories());
  const [inputValue,        setInputValue]        = useState("");
  const [isTyping,          setIsTyping]          = useState(false);
  const [inventory,         setInventory]         = useState([]);
  const [diary,             setDiary]             = useState([]);
  const [toastItem,         setToastItem]         = useState(null);
  const [systemToast,       setSystemToast]       = useState(null);
  const [rechargeOpen,      setRechargeOpen]      = useState(false);
  const [scheduleResults,   setScheduleResults]   = useState({});
  const [eventResult,       setEventResult]       = useState(null);
  const [diaryOpen,         setDiaryOpen]         = useState(false);
  const [writeDiaryOpen,    setWriteDiaryOpen]    = useState(false);
  

  const activeCharacter = useMemo(() => characters.find((c) => c.id === activeCharacterId), [activeCharacterId]);
  const currentMessages = activeCharacterId ? chatHistories[activeCharacterId] || [] : [];

  useEffect(() => {
    if (pageContentRef.current) pageContentRef.current.scrollTo({ top: 0, behavior: "auto" });
  }, [activeTab, flowStep]);

  useEffect(() => {
    if (flowStep === "chat") scrollChatToBottom("smooth");
  }, [chatHistories, activeCharacterId, isTyping, flowStep]);

  function scrollChatToBottom(behavior = "smooth") {
    requestAnimationFrame(() => {
      if (chatListRef.current)
        chatListRef.current.scrollTo({ top: chatListRef.current.scrollHeight, behavior });
    });
  }

  function enterApp() { setHasEnteredApp(true); setFlowStep("profile"); }

  function handleChooseProfile(p) {
    setProfile(p);
    setStats({ ...zeroStats });
    setMoodPicked(false);
    setActiveTab("home");
    setFlowStep("pickMood"); // 选完身份先选心情
  }

  function handlePickMood(option) {
    setStats((prev) => ({
      ...prev,
      mood:    option.mood,
      stamina: option.stamina,
    }));
    setMoodPicked(true);
    setFlowStep(null);
  }

  function handleTabChange(tab) {
    setActiveTab(tab); setFlowStep(null); setActiveCharacterId(null);
    setInputValue(""); setIsTyping(false);
  }

  function openCharacterChat(id) {
    setActiveCharacterId(id); setFlowStep("chat");
    setTimeout(() => scrollChatToBottom("auto"), 0);
  }

  function goBackFromChat() {
    setFlowStep(null); setActiveTab("characters");
    setActiveCharacterId(null); setInputValue(""); setIsTyping(false);
  }

  function applyEffect(effect, characterId) {
    if (!effect || !stats) return;
    setStats((prev) => ({
      popularity: clamp(prev.popularity + (effect.popularity || 0), 0, 9999),
      mood:       clamp(prev.mood       + (effect.mood       || 0), 0, 100),
      stamina:    clamp(prev.stamina    + (effect.stamina    || 0), 0, 100),
      charm:      clamp(prev.charm      + (effect.charm      || 0), 0, 100),
      bond:       clamp(prev.bond       + (effect.bond       || 0), 0, 100),
    }));
    if (characterId && effect.relation) {
      setRelations((prev) => ({
        ...prev,
        [characterId]: clamp((prev[characterId] || 0) + effect.relation, 0, 100),
      }));
    }
  }

  function addDiaryEntry(entry) {
    const time = getCurrentTime();
    setDiary((prev) => [
      { id: `diary-${Date.now()}-${Math.random().toString(16).slice(2)}`, time, ...entry },
      ...prev,
    ]);
  }

  function addInventoryItem(item, characterName) {
    setInventory((prev) => {
      const ex = prev.find((t) => t.id === item.id);
      if (ex) return prev.map((t) => t.id === item.id ? { ...t, count: t.count + 1 } : t);
      return [{ ...item, count: 1, from: characterName || "星房" }, ...prev];
    });
    setToastItem({ ...item, fromName: characterName });
    addDiaryEntry({ type: "道具", title: `收到：${item.name}`, text: item.flavor, characterName: characterName || "星房", icon: item.emoji });
    setTimeout(() => setToastItem(null), 3200);
  }

  function typeMessage(characterId, fullText) {
    const tid = `typing-${Date.now()}`;
    setChatHistories((prev) => ({
      ...prev,
      [characterId]: [...(prev[characterId] || []), { id: tid, sender: "ai", text: "", time: getCurrentTime(), complete: false }],
    }));
    setTimeout(() => scrollChatToBottom("auto"), 0);
    let i = 0;
    const timer = setInterval(() => {
      i++;
      setChatHistories((prev) => ({
        ...prev,
        [characterId]: (prev[characterId] || []).map((m) =>
          m.id === tid ? { ...m, text: fullText.slice(0, i), complete: i >= fullText.length } : m
        ),
      }));
      scrollChatToBottom("auto");
      if (i >= fullText.length) {
        clearInterval(timer); setIsTyping(false);
        setTimeout(() => scrollChatToBottom("smooth"), 0);
      }
    }, 28);
  }

  function handleSend() {
    const text = inputValue.trim();
    if (!text || !activeCharacter) return;
    const userMsg = { id: `user-${Date.now()}`, sender: "user", text, time: getCurrentTime(), complete: true };
    setChatHistories((prev) => ({ ...prev, [activeCharacter.id]: [...(prev[activeCharacter.id] || []), userMsg] }));
    setInputValue("");
    setIsTyping(true);
    setTimeout(() => scrollChatToBottom("smooth"), 0);

    // 对话关键词直接影响状态
    const moodEffect = getMoodEffectFromText(text);
    if (moodEffect) applyEffect(moodEffect, null);

    const relationVal = relations[activeCharacter.id] || 0;
    const replyText   = generateReply(text, activeCharacter, relationVal);
    const item        = detectItem(text, activeCharacter.id, inventory);

    setTimeout(() => {
      typeMessage(activeCharacter.id, replyText);
      if (item) {
        setTimeout(() => { applyEffect(item.effect, activeCharacter.id); addInventoryItem(item, activeCharacter.name); }, 700);
      } else {
        applyEffect(getSilentEffect(text), activeCharacter.id);
      }
    }, 500);
  }

  function handleScheduleChoice(event, choice) {
    if (scheduleResults[event.id]) {
      setEventResult({ title: event.title, text: "这个日程今天已经结束了。星房里的时间不会倒流。", icon: event.icon, source: "系统" });
      return;
    }
    applyEffect(choice.effect, choice.characterId);
    const relChar = choice.characterId ? characters.find((c) => c.id === choice.characterId) : null;
    setScheduleResults((prev) => ({ ...prev, [event.id]: { choiceId: choice.id, characterId: choice.characterId || null } }));
    setEventResult({ title: event.title, text: choice.result, character: relChar, icon: event.icon, source: "日程" });
    setSystemToast("今天的状态悄悄发生了一点变化");
    setTimeout(() => setSystemToast(null), 2200);
  }

  function handleRecharge(plan) {
    setDiamonds((prev) => prev + plan.amount);
    setRechargeOpen(false);
    setSystemToast("星钻已补充");
    setTimeout(() => setSystemToast(null), 2200);
  }

  function resetGame() {
    setHasEnteredApp(false); setProfile(null); setStats(null); setMoodPicked(false); setDiamonds(0);
    setActiveTab("home"); setFlowStep(null); setActiveCharacterId(null);
    setRelations(createInitialRelations()); setChatHistories(createInitialChatHistories());
    setInputValue(""); setIsTyping(false); setInventory([]); setDiary([]);
    setToastItem(null); setSystemToast(null); setRechargeOpen(false);
    setScheduleResults({}); setEventResult(null); setDiaryOpen(false); setWriteDiaryOpen(false);
  }

  // ── 欢迎页
  if (!hasEnteredApp) {
    return (
      <main className="app-shell">
        <div className="phone welcome-phone">
          <div className="welcome-bg"></div>
          <div className="welcome-status"><span>{clock}</span><span>62%</span></div>
          <section className="welcome-content">
            <div className="app-logo">✦</div>
            <p className="welcome-kicker">StarryMuse Box</p>
            <h1>装着星光、<br />角色与秘密日程的<br />偶像箱庭</h1>
            <p className="welcome-desc">你将在出道前 7 日进入星房，与不同角色对话、安排日程、收集道具，并慢慢改变彼此的关系。</p>
            <button className="primary-btn" onClick={enterApp}>进入星房</button>
          </section>
        </div>
      </main>
    );
  }

  // ── 选身份页
  if (flowStep === "profile") {
    return (
      <AppFrame title="创建偶像身份" subtitle="出道前 7 日 · 选择你的起点"
        activeTab={activeTab} onTabChange={handleTabChange} hideNav clock={clock} pageContentRef={pageContentRef}>
        <ProfileSelectPage onSelect={handleChooseProfile} />
      </AppFrame>
    );
  }

  // ── 选心情页
  if (flowStep === "pickMood") {
    return (
      <AppFrame title="今天感觉怎么样" subtitle="说说你现在的状态" hideNav clock={clock}
        activeTab={activeTab} onTabChange={handleTabChange} pageContentRef={pageContentRef}>
        <MoodPickPage onPick={handlePickMood} />
      </AppFrame>
    );
  }

  // ── 聊天页
  if (flowStep === "chat") {
    return (
      <main className="app-shell">
        <div className="phone chat-phone">
          <ChatHeader character={activeCharacter} stage={getRelationStage(relations[activeCharacterId] || 0)} onBack={goBackFromChat} clock={clock} />
          <section className="chat-list" ref={chatListRef}>
            {currentMessages.map((msg) => <ChatBubble key={msg.id} message={msg} character={activeCharacter} />)}
            {isTyping && (
              <div className="typing-row">
                <div className="typing-avatar">{activeCharacter?.avatar}</div>
                <div className="typing-bubble"><span></span><span></span><span></span></div>
              </div>
            )}
          </section>
          <section className="input-area imessage">
            <button className="plus-btn" type="button">+</button>
            <input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Message"
              inputMode="text"
              enterKeyHint="send"
              style={{ fontSize: "16px" }}
              onKeyDown={(e) => { if (e.key === "Enter") handleSend(); }}
            />
            <button className={inputValue.trim() ? "send-btn active" : "send-btn"} onClick={handleSend}>↑</button>
          </section>
          <BottomNav active={activeTab} onChange={handleTabChange} />
          {toastItem   && <ItemToast item={toastItem} />}
          {systemToast && <SystemToast text={systemToast} />}
        </div>
      </main>
    );
  }

  // ── 主页面
  return (
    <AppFrame title={getTabTitle(activeTab)} subtitle={getTabSubtitle(activeTab, profile)}
      activeTab={activeTab} onTabChange={handleTabChange} clock={clock} pageContentRef={pageContentRef}>
      {activeTab === "home" && (
        <HomePage profile={profile} stats={stats} inventory={inventory} relations={relations}
          onCreateProfile={() => setFlowStep("profile")} onOpenCharacters={() => setActiveTab("characters")} />
      )}
      {activeTab === "characters" && (
        <CharactersPage profile={profile} relations={relations} chatHistories={chatHistories}
          onCreateProfile={() => setFlowStep("profile")} onOpenChat={openCharacterChat} />
      )}
      {activeTab === "schedule" && (
        <SchedulePage profile={profile} events={scheduleEvents} scheduleResults={scheduleResults}
          onCreateProfile={() => setFlowStep("profile")} onChoose={handleScheduleChoice}
          onOpenDiary={() => setWriteDiaryOpen(true)} />
      )}
      {activeTab === "inventory" && <InventoryPage inventory={inventory} />}
      {activeTab === "profile" && (
        <ArchivePage profile={profile} stats={stats} relations={relations}
          inventory={inventory} diary={diary} diamonds={diamonds}
          rechargeOpen={rechargeOpen}
          onOpenRecharge={() => setRechargeOpen(true)} onCloseRecharge={() => setRechargeOpen(false)}
          onRecharge={handleRecharge} onCreateProfile={() => setFlowStep("profile")}
          onOpenDiary={() => setDiaryOpen(true)} onReset={resetGame} />
      )}
      {eventResult && (
        <EventResultModal result={eventResult}
          onRemember={() => {
            addDiaryEntry({ type: eventResult.source || "日程", title: eventResult.title, text: eventResult.text, characterName: eventResult.character?.name || "自己", icon: eventResult.icon || eventResult.character?.avatar || "🌙" });
            setEventResult(null);
            setSystemToast("这一刻已经写入星房日记");
            setTimeout(() => setSystemToast(null), 2200);
          }}
          onClose={() => setEventResult(null)} />
      )}
      {diaryOpen && (
        <DiaryModal diary={diary} onClose={() => setDiaryOpen(false)}
          onWrite={() => { setDiaryOpen(false); setWriteDiaryOpen(true); }} />
      )}
      {writeDiaryOpen && (
        <WriteDiaryModal
          onSave={(entry) => { addDiaryEntry(entry); setSystemToast("已写入星房日记"); setTimeout(() => setSystemToast(null), 2200); }}
          onClose={() => setWriteDiaryOpen(false)} />
      )}
      {systemToast && <SystemToast text={systemToast} />}
    </AppFrame>
  );
}
// ── 工具函数 ──────────────────────────────────────────────────────

function getTabTitle(tab) {
  return { home:"星房", characters:"角色", schedule:"日程", inventory:"道具", profile:"档案" }[tab] || "星房";
}

function getTabSubtitle(tab, profile) {
  if (tab==="home")       return profile ? `${profile.emoji} 出道前 7 日` : "先创建你的偶像身份";
  if (tab==="characters") return "与星房中的角色慢慢靠近";
  if (tab==="schedule")   return "选择今天要如何度过";
  if (tab==="inventory")  return "已经留下的物品与回忆";
  return "偶像资料与个人中心";
}

// ── 框架组件 ──────────────────────────────────────────────────────

function AppFrame({ title, subtitle, activeTab, onTabChange, children, hideNav, clock, pageContentRef }) {
  return (
    <main className="app-shell">
      <div className="phone app-phone">
        <Header title={title} subtitle={subtitle} clock={clock} />
        <div className="page-content" ref={pageContentRef}>{children}</div>
        {!hideNav && <BottomNav active={activeTab} onChange={onTabChange} />}
      </div>
    </main>
  );
}

function Header({ title, subtitle, clock }) {
  return (
    <header className="top-header">
      <div className="status-time">{clock}</div>
      <div className="header-title"><h1>{title}</h1><p>{subtitle}</p></div>
      <div className="status-battery">62%</div>
    </header>
  );
}

function BottomNav({ active, onChange }) {
  const tabs = [
    { id:"home",       icon:"🏠", label:"星房" },
    { id:"characters", icon:"💬", label:"角色" },
    { id:"schedule",   icon:"🗓️", label:"日程" },
    { id:"inventory",  icon:"🎁", label:"道具" },
    { id:"profile",    icon:"👤", label:"档案" },
  ];
  return (
    <nav className="bottom-nav">
      {tabs.map((t) => (
        <button key={t.id} className={active===t.id ? "active" : ""} onClick={() => onChange(t.id)}>
          <span>{t.icon}</span><strong>{t.label}</strong>
        </button>
      ))}
    </nav>
  );
}

// ── 选身份页 ──────────────────────────────────────────────────────

function ProfileSelectPage({ onSelect }) {
  return (
    <>
      <section className="intro-card">
        <span className="mini-label">STARTING POINT</span>
        <h2>选择你的新人偶像身份</h2>
        <p>身份会影响角色对你的理解与后续氛围。成长会从空白开始，由你之后的选择慢慢填上。</p>
      </section>
      <section className="section">
        <div className="profile-list">
          {idolProfiles.map((item) => (
            <button className="profile-card" key={item.id} onClick={() => onSelect(item)}>
              <div className="profile-emoji">{item.emoji}</div>
              <div className="profile-content">
                <h3>{item.name}</h3>
                <span>{item.title}</span>
                <p>{item.desc}</p>
                <div className="tag-row">
                  {item.tags.map((tag) => <span key={tag}>{tag}</span>)}
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>
    </>
  );
}

// ── 选心情页 ──────────────────────────────────────────────────────

function MoodPickPage({ onPick }) {
  return (
    <>
      <section className="intro-card">
        <span className="mini-label">TODAY'S MOOD</span>
        <h2>今天感觉怎么样？</h2>
        <p>说说你现在的状态，星房会根据你的心情慢慢变化。</p>
      </section>
      <section className="section">
        <div className="mood-list">
          {moodOptions.map((opt, i) => (
            <button className="mood-card" key={i} onClick={() => onPick(opt)}>
              <span>{opt.label}</span>
            </button>
          ))}
        </div>
      </section>
    </>
  );
}

// ── 软状态展示 ────────────────────────────────────────────────────

function SoftStats({ stats }) {
  const rows = [
    { label:"心情",   hint: getMoodHint(stats.mood) },
    { label:"体力",   hint: getStaminaHint(stats.stamina) },
    { label:"舞台感", hint: getCharmHint(stats.charm) },
  ];
  return (
    <div className="soft-stats">
      {rows.map((r) => (
        <div key={r.label} className="soft-stat-row">
          <span className="soft-stat-label">{r.label}</span>
          <span className="soft-stat-hint">{r.hint}</span>
        </div>
      ))}
    </div>
  );
}

// ── 主页 ──────────────────────────────────────────────────────────

function HomePage({ profile, stats, inventory, relations, onCreateProfile, onOpenCharacters }) {
  const sorted           = Object.entries(relations).sort((a, b) => b[1] - a[1]);
  const topEntry         = sorted[0];
  const closestChar      = characters.find((c) => c.id === topEntry?.[0]);
  const unlockedFeatures = stats ? getUnlockedFeatures(stats, relations) : [];

  return (
    <>
      <section className="home-hero">
        <div className="hero-text-block">
          <span className="eyebrow">出道前 7 日</span>
          <h1>今晚的星房，<br />还亮着灯</h1>
          <p>有些关系不会突然改变，只会在一次次选择里，慢慢留下痕迹。</p>
        </div>
        <div className="hero-visual">
          <div className="orbit orbit-one"></div>
          <div className="orbit orbit-two"></div>
          <div className="idol-figure">🎤</div>
        </div>
      </section>

      <section className="section">
        {!profile ? (
          <div className="empty-card">
            <span className="mini-label">CREATE PROFILE</span>
            <h2>你还没有进入箱庭</h2>
            <p>先创建一个新人偶像身份，解锁角色、日程和道具系统。</p>
            <button className="primary-btn small" onClick={onCreateProfile}>创建偶像身份</button>
          </div>
        ) : (
          <div className="current-card">
            <div className="current-top">
              <div className="current-avatar">{profile.emoji}</div>
              <div className="current-info">
                <span className="mini-label">CURRENT IDOL</span>
                <h2>{profile.name}</h2>
                <p>{profile.title}</p>
              </div>
            </div>
            <p className="current-desc">{profile.desc}</p>
            {stats && <SoftStats stats={stats} />}
            <button className="primary-btn small" onClick={onOpenCharacters}>
              去见正在等你的人
            </button>
          </div>
        )}
      </section>

      {unlockedFeatures.length > 0 && (
        <section className="section">
          <div className="section-title-row">
            <div><span className="mini-label">UNLOCKED</span><h2>新的可能性</h2></div>
          </div>
          <div className="unlock-list">
            {unlockedFeatures.map((f, i) => (
              <div className="unlock-card" key={i}>
                <span className="unlock-icon">{f.icon}</span>
                <div><strong>{f.label}</strong><p>{f.desc}</p></div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="section">
        <div className="section-title-row">
          <div><span className="mini-label">ROOM STATUS</span><h2>星房状态</h2></div>
        </div>
        <div className="room-grid">
          <div className="room-card">
            <span>💫</span>
            <strong>最靠近的人</strong>
            <p>{closestChar && topEntry[1] > 0 ? `${closestChar.name} · ${getRelationStage(topEntry[1])}` : "尚未建立"}</p>
          </div>
          <div className="room-card">
            <span>🎁</span>
            <strong>留下的物品</strong>
            <p>{inventory.length > 0 ? `${inventory.length} 件` : "还没有"}</p>
          </div>
        </div>
      </section>
    </>
  );
}

// ── 角色页 ────────────────────────────────────────────────────────

function CharactersPage({ profile, relations, chatHistories, onCreateProfile, onOpenChat }) {
  if (!profile) {
    return (
      <section className="section">
        <div className="empty-card">
          <span className="mini-label">LOCKED</span>
          <h2>角色列表暂未开启</h2>
          <p>创建偶像身份后，星房中的角色会陆续出现。</p>
          <button className="primary-btn small" onClick={onCreateProfile}>创建偶像身份</button>
        </div>
      </section>
    );
  }
  return (
    <section className="section">
      <div className="section-title-row">
        <div><span className="mini-label">CHARACTERS</span><h2>星房角色</h2></div>
      </div>
      <div className="character-list">
        {characters.map((character) => {
          const history = chatHistories[character.id] || [];
          const latest  = history[history.length - 1]?.text || character.opening;
          const relVal  = relations[character.id] || 0;
          const stage   = getRelationStage(relVal);
          const preview = latest.length > 36 ? latest.slice(0, 36) + "…" : latest;
          return (
            <button className="character-card" key={character.id} onClick={() => onOpenChat(character.id)}>
              <div className="character-avatar">{character.avatar}</div>
              <div className="character-main">
                <div className="character-row">
                  <h3>{character.name}</h3>
                  <span className="character-role">{character.role}</span>
                </div>
                <strong>{stage}</strong>
                <p>{preview}</p>
                <div className="stage-pill">{character.relationName}正在变化</div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

// ── 日程页 ────────────────────────────────────────────────────────

function SchedulePage({ profile, events, scheduleResults, onCreateProfile, onChoose, onOpenDiary }) {
  if (!profile) {
    return (
      <section className="intro-card">
        <span className="mini-label">DAILY EVENTS</span>
        <h2>日程尚未开启</h2>
        <p>创建身份后，你可以安排今天如何度过。</p>
        <button className="primary-btn small" onClick={onCreateProfile}>创建偶像身份</button>
      </section>
    );
  }
  return (
    <>
      {/* 日记入口：放在最顶部 */}
      <section className="section" style={{ paddingTop: 16 }}>
        <button className="diary-schedule-btn" onClick={onOpenDiary}>
          <span>📓</span>
          <span>写下今天的日记</span>
        </button>
      </section>

      <section className="intro-card">
        <span className="mini-label">DAILY EVENTS</span>
        <h2>今日星房日程</h2>
        <p>你可以独自完成，也可以邀请某个人一起。每个日程都可以选择跳过。</p>
      </section>

      <section className="section">
        <div className="event-list">
          {events.map((event) => {
            const finished = Boolean(scheduleResults[event.id]);
            return (
              <div className={finished ? "event-card done" : "event-card"} key={event.id}>
                <div className="event-time">{event.time}</div>
                <div className="event-icon">{event.icon}</div>
                <div className="event-main">
                  <h3>{event.title}</h3>
                  <p>{event.desc}</p>
                  <div className="choice-list">
                    {event.choices.map((choice) => (
                      <button key={choice.id} className="choice-btn" disabled={finished}
                        onClick={() => onChoose(event, choice)}>
                        <strong>{choice.label}</strong>
                        <span>{choice.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <span className={finished ? "event-status available" : "event-status"}>
                  {finished ? "已完成" : "待选择"}
                </span>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}

// ── 道具页 ────────────────────────────────────────────────────────

function InventoryPage({ inventory }) {
  return (
    <>
      <section className="intro-card">
        <span className="mini-label">INVENTORY</span>
        <h2>道具背包</h2>
        <p>有些东西不会立刻改变你，但会证明某一刻确实发生过。</p>
      </section>
      <section className="section">
        {inventory.length === 0 ? (
          <div className="empty-small">
            暂时什么都没有。<br />
            有些物品只会在特定对话后悄悄出现。
          </div>
        ) : (
          <div className="inventory-grid">
            {inventory.map((item) => (
              <div className="inventory-card" key={item.id}>
                <div className="inventory-icon">{item.emoji}</div>
                <h3>{item.name}</h3>
                <span>{item.type}</span>
                <p>{item.message}</p>
                <strong>{item.flavor}</strong>
                <em>x{item.count}</em>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

// ── 档案页 ────────────────────────────────────────────────────────

function ArchivePage({
  profile, stats, relations, inventory, diary, diamonds,
  rechargeOpen, onOpenRecharge, onCloseRecharge, onRecharge,
  onCreateProfile, onOpenDiary, onReset,
}) {
  const sorted   = Object.entries(relations).sort((a, b) => b[1] - a[1]);
  const topEntry = sorted[0];
  const topChar  = characters.find((c) => c.id === topEntry?.[0]);
  const topStage = topEntry && topEntry[1] > 0 ? getRelationStage(topEntry[1]) : null;

  return (
    <>
      <section className="archive-card">
        <div className="archive-avatar">{profile?.emoji || "👤"}</div>
        <h2>{profile ? profile.name : "未创建身份"}</h2>
        <p>{profile ? profile.title : "创建身份后，你的星房档案会在这里生成。"}</p>
        {!profile && <button className="primary-btn small" onClick={onCreateProfile}>创建身份</button>}
      </section>

      <section className="section">
        {stats && (
          <div className="archive-list" style={{ marginBottom: 16 }}>
            <div className="archive-row"><span>心情</span><strong>{getMoodHint(stats.mood)}</strong></div>
            <div className="archive-row"><span>体力</span><strong>{getStaminaHint(stats.stamina)}</strong></div>
            <div className="archive-row"><span>舞台感</span><strong>{getCharmHint(stats.charm)}</strong></div>
          </div>
        )}

        <div className="wallet-card">
          <div>
            <span className="mini-label">WALLET</span>
            <h2>星钻</h2>
            <p>当前持有 {diamonds} 枚</p>
          </div>
          <button className="primary-btn small" onClick={onOpenRecharge}>补充星钻</button>
        </div>

        <div className="archive-list">
          <div className="archive-row">
            <span>已获得道具</span>
            <strong>{inventory.length > 0 ? `${inventory.length} 件` : "还没有"}</strong>
          </div>
          <div className="archive-row">
            <span>最近的关系</span>
            <strong>{topStage && topChar ? `${topChar.name} · ${topStage}` : "尚未建立"}</strong>
          </div>
          <div className="archive-row">
            <span>星房日记</span>
            <strong>{diary.length > 0 ? `${diary.length} 条记录` : "还没有记录"}</strong>
          </div>
        </div>

        {/* 日记独立入口按钮 */}
        <button className="diary-open-btn" onClick={onOpenDiary}>
          <span>📓</span>
          <div>
            <strong>星房日记</strong>
            <p>{diary.length > 0 ? `共 ${diary.length} 页，点击翻阅` : "还没有写下任何东西"}</p>
          </div>
          <span className="diary-open-arrow">›</span>
        </button>

        <button className="danger-btn" onClick={onReset}>退出并重新开始</button>
      </section>

      {rechargeOpen && (
        <div className="recharge-mask" onClick={onCloseRecharge}>
          <div className="recharge-panel" onClick={(e) => e.stopPropagation()}>
            <div className="recharge-title-row">
              <div><span className="mini-label">RECHARGE</span><h2>补充星钻</h2></div>
              <button className="close-btn" onClick={onCloseRecharge}>×</button>
            </div>
            <div className="recharge-list">
              {rechargePlans.map((plan) => (
                <button className="recharge-card" key={plan.id} onClick={() => onRecharge(plan)}>
                  <div><h3>{plan.name}</h3><p>{plan.desc}</p></div>
                  <div className="recharge-amount">
                    <strong>+{plan.amount}</strong>
                    <span>{plan.price}</span>
                  </div>
                </button>
              ))}
            </div>
            <p className="recharge-note">当前为作品集 Demo 展示入口，不会发起真实支付。</p>
          </div>
        </div>
      )}
    </>
  );
}

// ── 聊天头部 ──────────────────────────────────────────────────────

function ChatHeader({ character, stage, onBack, clock }) {
  return (
    <header className="chat-header">
      <button className="icon-btn" onClick={onBack}>←</button>
      <div className="chat-user">
        <div className="chat-avatar">{character?.avatar || "💬"}</div>
        <div>
          <h1>{character?.name || "角色"}</h1>
          <p>{character?.role || "星房角色"} · {stage}</p>
        </div>
      </div>
      <div className="status-battery" style={{ fontSize:13, color:"#8c7b99" }}>{clock}</div>
    </header>
  );
}

// ── 聊天气泡 ──────────────────────────────────────────────────────

function ChatBubble({ message, character }) {
  const isUser = message.sender === "user";
  return (
    <div className={`bubble-row ${isUser ? "user" : "ai"}`}>
      {!isUser && <div className="bubble-avatar">{character?.avatar || "💬"}</div>}
      <div className={`bubble ${isUser ? "user-bubble" : "ai-bubble"}`}>
        <p>
          {message.text}
          {!isUser && !message.complete && <span className="cursor">|</span>}
        </p>
        <span>{message.time}</span>
      </div>
    </div>
  );
}

// ── 道具类型映射 ──────────────────────────────────────────────────
const ITEM_TYPE_MAP = {
  "外卖订单":     "delivery",
  "同城跑腿":     "delivery",
  "快递寄送":     "express",
  "品牌寄送":     "express",
  "图片消息":     "image",
  "群聊截图":     "image",
  "粉丝群图片":   "image",
  "直播弹幕合集": "image",
  "直播礼物":     "live_gift",
  "工作台文件":   "file",
  "任务清单":     "file",
  "复盘报告":     "file",
  "数据报告":     "file",
  "数据图表":     "file",
  "商务评估文档": "file",
  "舆情过滤":     "file",
  "高光剪辑":     "file",
  "商务邮件":     "email",
  "电子通行证":   "pass",
  "日程调整":     "schedule",
};

// ── 道具 Toast ────────────────────────────────────────────────────

function ItemToast({ item, fromName }) {
  const kind = ITEM_TYPE_MAP[item.type] || "default";

  // 配送中（外卖 / 跑腿）
  if (kind === "delivery") {
    return (
      <div className="it-wrap it-delivery">
        <div className="it-delivery-header">
          <span className="it-delivery-app">
            {item.type === "外卖订单" ? "🛵 外卖派送中" : "🏃 同城跑腿"}
          </span>
          <span className="it-delivery-eta">预计 15 分钟</span>
        </div>
        <div className="it-delivery-body">
          <div className="it-delivery-icon">{item.emoji}</div>
          <div className="it-delivery-info">
            <strong>{item.name}</strong>
            <span>{item.message}</span>
          </div>
        </div>
        <div className="it-delivery-track">
          <div className="it-track-dot active" />
          <div className="it-track-line" style={{ flex: 1 }} />
          <div className="it-track-dot" />
          <div className="it-track-line" style={{ flex: 1 }} />
          <div className="it-track-dot" />
          <span className="it-track-labels">已接单</span>
          <span className="it-track-label">配送中</span>
          <span className="it-track-label">已送达</span>
        </div>
      </div>
    );
  }

  // 快递到了
  if (kind === "express") {
    return (
      <div className="it-wrap it-express">
        <div className="it-express-header">
          <span>📦 快递通知</span>
          <span className="it-express-badge">已揽件</span>
        </div>
        <div className="it-express-body">
          <div className="it-express-icon">{item.emoji}</div>
          <div className="it-express-info">
            <strong>{item.name}</strong>
            <span className="it-express-no">运单号 · SM{Math.floor(Math.random()*9000+1000)}</span>
            <p>{item.message}</p>
          </div>
        </div>
      </div>
    );
  }

  // 图片 / 截图 / 弹幕截图
  if (kind === "image") {
    return (
      <div className="it-wrap it-image">
        <div className="it-image-header">
          <div className="it-image-avatar">{fromName?.[0] || "✦"}</div>
          <div className="it-image-from">
            <strong>{fromName || "星房"}</strong>
            <span>{item.type}</span>
          </div>
        </div>
        {/* 模拟截图卡片 */}
        <div className="it-image-preview">
          <div className="it-image-mock">
            <div className="it-mock-bar" />
            <div className="it-mock-line w80" />
            <div className="it-mock-line w60" />
            <div className="it-mock-line w70" />
            <div className="it-mock-emoji">{item.emoji}</div>
          </div>
          <p className="it-image-caption">{item.message}</p>
        </div>
      </div>
    );
  }

  // 直播礼物
  if (kind === "live_gift") {
    return (
      <div className="it-wrap it-live">
        <div className="it-live-badge">🔴 直播间</div>
        <div className="it-live-body">
          <span className="it-live-icon">{item.emoji}</span>
          <div>
            <strong>{item.name}</strong>
            <p>{item.message}</p>
          </div>
        </div>
        <div className="it-live-bar">
          <span>💬</span><span>💬</span><span>💬</span>
          <span className="it-live-more">+99 条弹幕</span>
        </div>
      </div>
    );
  }

  // 邮件
  if (kind === "email") {
    return (
      <div className="it-wrap it-email">
        <div className="it-email-header">
          <span>✉️ 新邮件</span>
          <span className="it-email-from">来自 {fromName || "星房"}</span>
        </div>
        <div className="it-email-subject">{item.name}</div>
        <p className="it-email-preview">{item.message}</p>
      </div>
    );
  }

  // 通行证
  if (kind === "pass") {
    return (
      <div className="it-wrap it-pass">
        <div className="it-pass-top">
          <span className="it-pass-label">PASS</span>
          <span className="it-pass-icon">{item.emoji}</span>
        </div>
        <strong className="it-pass-name">{item.name}</strong>
        <p className="it-pass-msg">{item.message}</p>
        <div className="it-pass-barcode">
          {"▌▍▌▌▍▌▍▌▍▌▌▍▌▍▌▌▍▌"}
        </div>
      </div>
    );
  }

  // 日程调整
  if (kind === "schedule") {
    return (
      <div className="it-wrap it-schedule">
        <div className="it-schedule-header">
          <span>🗓 日程已更新</span>
        </div>
        <div className="it-schedule-body">
          <div className="it-schedule-icon">{item.emoji}</div>
          <div>
            <strong>{item.name}</strong>
            <p>{item.message}</p>
          </div>
        </div>
      </div>
    );
  }

  // 文件 / 报告 / 清单（默认）
  return (
    <div className="it-wrap it-file">
      <div className="it-file-header">
        <span>📄 {item.type}</span>
        <span className="it-file-from">{fromName || "星房"}</span>
      </div>
      <div className="it-file-body">
        <div className="it-file-icon">{item.emoji}</div>
        <div className="it-file-info">
          <strong>{item.name}</strong>
          <p>{item.message}</p>
        </div>
      </div>
    </div>
  );
}

// ── 系统 Toast ────────────────────────────────────────────────────

function SystemToast({ text }) {
  return <div className="system-toast">{text}</div>;
}

// ── 日程结果弹窗 ──────────────────────────────────────────────────

function EventResultModal({ result, onRemember, onClose }) {
  return (
    <div className="event-mask" onClick={onClose}>
      <div className="event-result" onClick={(e) => e.stopPropagation()}>
        <div className="event-result-icon">{result.icon || result.character?.avatar || "🌙"}</div>
        <h2>{result.title}</h2>
        <p>{result.text}</p>
        <div className="modal-actions">
          <button className="secondary-btn small" onClick={onClose}>关闭</button>
          {result.source !== "系统" && (
            <button className="primary-btn small" onClick={onRemember}>📓 记入日记</button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── 日记本弹窗 ────────────────────────────────────────────────────

function DiaryModal({ diary, onClose, onWrite }) {
  return (
    <div className="diary-mask" onClick={onClose}>
      <div className="diary-modal" onClick={(e) => e.stopPropagation()}>
        <div className="diary-modal-header">
          <div>
            <span className="mini-label">DIARY</span>
            <h2>星房日记</h2>
          </div>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <p className="diary-modal-sub">这几天发生的事，都在这里。</p>
        {diary.length === 0 ? (
          <div className="diary-empty-block">
            <span>📓</span>
            <p>还没有写下任何东西。<br />完成日程后可以把某一刻记在这里。</p>
          </div>
        ) : (
          <div className="diary-scroll">
            {diary.map((entry) => (
              <div className="diary-entry-modal" key={entry.id}>
                <div className="diary-entry-top">
                  <span className="diary-entry-icon">{entry.icon || "🌙"}</span>
                  <div className="diary-entry-meta">
                    <strong>{entry.title}</strong>
                    <span>{entry.time} · {entry.type}</span>
                  </div>
                </div>
                <p className="diary-entry-body">{entry.text}</p>
                {entry.characterName && (
                  <em className="diary-entry-char">与 {entry.characterName} 有关</em>
                )}
              </div>
            ))}
          </div>
        )}
        <button className="primary-btn small diary-write-btn" onClick={onWrite}>
          ✏️ 写下今天
        </button>
      </div>
    </div>
  );
}

function VirtualKeyboard({ value, onChange, onSend, onClose }) {
  const rows = [
    ['q','w','e','r','t','y','u','i','o','p'],
    ['a','s','d','f','g','h','j','k','l'],
    ['⇧','z','x','c','v','b','n','m','⌫'],
    ['123','，','　','。','↩']
  ];
  const [isNum, setIsNum] = React.useState(false);
  const numRows = [
    ['1','2','3','4','5','6','7','8','9','0'],
    ['-','/','：','；','（','）','￥','@','"','、'],
    ['。','，','？','！','.','\'','"','"','⌫'],
    ['ABC','　','　','　','↩']
  ];

  const handleKey = (key) => {
    if (key === '⌫') {
      onChange(value.slice(0, -1));
    } else if (key === '↩') {
      onSend();
    } else if (key === '⇧' || key === 'ABC') {
      setIsNum(!isNum);
    } else if (key === '123') {
      setIsNum(true);
    } else if (key === '　') {
      onChange(value + ' ');
    } else {
      onChange(value + key);
    }
  };

  const activeRows = isNum ? numRows : rows;

  return (
    <div className="vkb-mask" onClick={onClose}>
      <div className="vkb-wrap" onClick={e => e.stopPropagation()}>
        <div className="vkb-preview">
          <span className="vkb-text">{value || <span className="vkb-placeholder">说点什么…</span>}</span>
          <button className="vkb-send" onClick={onSend} disabled={!value.trim()}>发送</button>
        </div>
        <div className="vkb-rows">
          {activeRows.map((row, ri) => (
            <div className="vkb-row" key={ri}>
              {row.map((key, ki) => (
                <button
                  key={ki}
                  className={`vkb-key ${['⌫','↩','⇧','123','ABC'].includes(key) ? 'vkb-key-func' : ''} ${key === '↩' ? 'vkb-key-send' : ''} ${key === '　' ? 'vkb-key-space' : ''}`}
                  onPointerDown={e => { e.preventDefault(); handleKey(key); }}
                >
                  {key === '⌫' ? '⌫' : key === '↩' ? '发' : key}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


// ── 写日记弹窗 ────────────────────────────────────────────────────

function WriteDiaryModal({ onSave, onClose }) {
  const [title, setTitle] = useState("");
  const [text,  setText]  = useState("");
  function handleSave() {
    if (!text.trim()) return;
    onSave({ title: title.trim() || "今天", text: text.trim(), type: "日记", icon: "📓", characterName: "自己" });
    onClose();
  }
  return (
    <div className="diary-mask" onClick={onClose}>
      <div className="diary-modal write-modal" onClick={(e) => e.stopPropagation()}>
        <div className="diary-modal-header">
          <div><span className="mini-label">WRITE</span><h2>写下今天</h2></div>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <input
          className="diary-title-input"
          placeholder="标题（可选）"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          inputMode="text"
        />
        <textarea
          className="diary-text-input"
          placeholder="今天发生了什么，或者你想记住什么……"
          value={text}
          onChange={(e) => setText(e.target.value)}
          inputMode="text"
          rows={6}
        />
        <div className="modal-actions">
          <button className="secondary-btn small" onClick={onClose}>取消</button>
          <button className="primary-btn small" onClick={handleSave} disabled={!text.trim()}>
            保存这一页
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;