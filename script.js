// script.js
(function() {
    'use strict';

    // ============================================================
    //  1. 主题切换
    // ============================================================
    const themeToggle = document.getElementById('themeToggle');
    let currentTheme = localStorage.getItem('oi-theme') || 'dark';

    function setTheme(theme) {
        document.body.classList.remove('light', 'dark');
        document.body.classList.add(theme);
        currentTheme = theme;
        localStorage.setItem('oi-theme', theme);
        themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
    setTheme(currentTheme);
    themeToggle.addEventListener('click', () => {
        setTheme(currentTheme === 'dark' ? 'light' : 'dark');
    });

    // ============================================================
    //  2. 菜单控制
    // ============================================================
    const menuOverlay = document.getElementById('menuOverlay');
    const startGameBtn = document.getElementById('startGameBtn');
    let gameStarted = false;

    function showMenu() {
        menuOverlay.classList.remove('hidden');
        gameStarted = false;
        startGameBtn.disabled = false;
    }

    function hideMenu() {
        menuOverlay.classList.add('hidden');
        gameStarted = true;
    }

    // ============================================================
    //  3. 知识等级系统
    // ============================================================
    const LEVELS = [
        { id: 'E', label: 'E', value: 0, threshold: 0 },
        { id: 'Ep', label: 'E+', value: 1, threshold: 3 },
        { id: 'D', label: 'D', value: 2, threshold: 8 },
        { id: 'Dp', label: 'D+', value: 3, threshold: 15 },
        { id: 'C', label: 'C', value: 4, threshold: 25 },
        { id: 'Cp', label: 'C+', value: 5, threshold: 38 },
        { id: 'B', label: 'B', value: 6, threshold: 55 },
        { id: 'Bp', label: 'B+', value: 7, threshold: 75 },
        { id: 'A', label: 'A', value: 8, threshold: 100 },
        { id: 'Ap', label: 'A+', value: 9, threshold: 130 },
        { id: 'S', label: 'S', value: 10, threshold: 165 },
        { id: 'SS', label: 'SS', value: 11, threshold: 205 },
        { id: 'SSS', label: 'SSS', value: 12, threshold: 250 },
        { id: 'U1e', label: 'U1e+', value: 13, threshold: 300 },
        { id: 'U1c', label: 'U1c+', value: 14, threshold: 360 },
        { id: 'U1b', label: 'U1b', value: 15, threshold: 430 },
        { id: 'U1a', label: 'U1a', value: 16, threshold: 510 },
        { id: 'U1sss', label: 'U1SSS', value: 17, threshold: 600 },
    ];

    function getLevel(exp) {
        let result = LEVELS[0];
        for (const lv of LEVELS) {
            if (exp >= lv.threshold) result = lv;
        }
        return result;
    }

    function getLevelClass(levelId) {
        return 'level-' + levelId;
    }

    // ============================================================
    //  4. 知识领域配置
    // ============================================================
    const KNOWLEDGE_DOMAINS = [
        { id: 'math', name: '数学' },
        { id: 'ds', name: 'DS' },
        { id: 'alg', name: '算法' },
        { id: 'dp', name: 'DP' },
        { id: 'graph', name: '图论' },
        { id: 'string', name: '字符串' },
        { id: 'comp', name: '计算几何' },
        { id: 'num', name: '数论' },
        { id: 'thinking', name: '思维' },
        { id: 'code', name: '代码' },
    ];

    // ============================================================
    //  5. 赛季配置
    // ============================================================
    const SEASON_CONFIG = [
        { year: 0, startTurn: 1, endTurn: 18, name: '高一赛季', events: [
            { turn: 3, name: 'CSP 第一轮', medalBase: 2, knowledgeReq: 20, desc: 'CSP 入门级' },
            { turn: 6, name: 'NOIP 初赛', medalBase: 3, knowledgeReq: 35, desc: '全国青少年信息学奥林匹克联赛' },
            { turn: 9, name: '省选 第一轮', medalBase: 4, knowledgeReq: 55, desc: '省级选拔' },
            { turn: 12, name: 'NOI 冬令营', medalBase: 5, knowledgeReq: 70, desc: '全国冬令营' },
            { turn: 15, name: '春季训练营', medalBase: 3, knowledgeReq: 50, desc: '春季集训' },
        ]},
        { year: 1, startTurn: 19, endTurn: 34, name: '高二赛季', events: [
            { turn: 21, name: 'CSP 第二轮', medalBase: 3, knowledgeReq: 55, desc: 'CSP 提高级' },
            { turn: 24, name: 'NOIP 复赛', medalBase: 4, knowledgeReq: 75, desc: 'NOIP 提高组' },
            { turn: 27, name: '省选 第二轮', medalBase: 5, knowledgeReq: 95, desc: '省队选拔' },
            { turn: 30, name: 'NOI 夏令营', medalBase: 6, knowledgeReq: 120, desc: 'NOI 夏令营' },
            { turn: 33, name: 'APIO 亚太赛', medalBase: 5, knowledgeReq: 100, desc: '亚太信息学奥赛' },
        ]},
        { year: 2, startTurn: 35, endTurn: 55, name: '高三赛季', events: [
            { turn: 37, name: 'NOI 全国赛', medalBase: 7, knowledgeReq: 140, desc: '全国信息学奥赛' },
            { turn: 41, name: 'CTS 国家队选拔', medalBase: 8, knowledgeReq: 170, desc: '国家队选拔' },
            { turn: 44, name: 'CTT 冬令营', medalBase: 6, knowledgeReq: 160, desc: '国家队冬令营' },
            { turn: 48, name: 'IOI 国际赛', medalBase: 10, knowledgeReq: 220, desc: '国际信息学奥赛' },
            { turn: 52, name: 'EGOI 欧洲赛', medalBase: 7, knowledgeReq: 180, desc: '欧洲女子奥赛' },
        ]}
    ];

    function getCurrentSeasonEvents(turn, year) {
        const season = SEASON_CONFIG.find(s => s.year === year);
        if (!season) return [];
        return season.events.filter(e => e.turn === turn);
    }

    function getCurrentSeasonName(year) {
        const s = SEASON_CONFIG.find(s => s.year === year);
        return s ? s.name : '未知赛季';
    }

    // ============================================================
    //  6. 天赋系统
    // ============================================================
    const TALENTS = [
        { id: 'genius', name: '天才', desc: '知识获取 +30%', type: 'good', effect: (s) => { s.talentBonus = 1.3; } },
        { id: 'diligent', name: '勤奋', desc: '训练消耗 -20%', type: 'good', effect: (s) => { s.trainCostMod = 0.8; } },
        { id: 'lucky', name: '幸运', desc: '比赛奖牌 +1', type: 'good', effect: (s) => { s.luckyBonus = 1; } },
        { id: 'focused', name: '专注', desc: '研究效率 +25%', type: 'good', effect: (s) => { s.focusMod = 1.25; } },
        { id: 'stress', name: '焦虑', desc: '精力消耗 +20%', type: 'bad', effect: (s) => { s.stressMod = 1.2; } },
        { id: 'distracted', name: '分心', desc: '知识获取 -20%', type: 'bad', effect: (s) => { s.distractedMod = 0.8; } },
        { id: 'lazy', name: '懒惰', desc: '行动费用 +30%', type: 'bad', effect: (s) => { s.lazyMod = 1.3; } },
        { id: 'impatient', name: '急躁', desc: '比赛成功率 -15%', type: 'bad', effect: (s) => { s.impatientMod = 0.85; } },
        { id: 'steady', name: '稳扎稳打', desc: '训练额外 +10% 经验', type: 'good', effect: (s) => { s.steadyBonus = 1.1; } },
    ];

    // ============================================================
    //  7. 游戏状态
    // ============================================================
    const state = {
        hp: 100,
        morale: 80,
        medal: 0,
        money: 500,
        year: 0,
        turn: 1,
        gameOver: false,
        maxTurn: 55,
        yearLabels: ['高一', '高二', '高三'],
        knowledge: KNOWLEDGE_DOMAINS.map(d => ({ id: d.id, name: d.name, exp: 0 })),
        talents: [],
        talentBonus: 1.0,
        trainCostMod: 1.0,
        luckyBonus: 0,
        stressMod: 1.0,
        distractedMod: 1.0,
        lazyMod: 1.0,
        focusMod: 1.0,
        impatientMod: 1.0,
        steadyBonus: 1.0,
        totalTrain: 0,
        totalContest: 0,
        totalRest: 0,
        totalResearch: 0,
        totalSocial: 0,
        totalAwaken: 0,
        endingTriggered: false,
        triggeredEvents: new Set(),
        contestInProgress: false,
        contestProgress: 0,
        trainTarget: 0,
        easterEggs: [],
    };

    function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

    function getAvgLevel() {
        let total = 0;
        for (const k of state.knowledge) {
            total += getLevel(k.exp).value;
        }
        const avg = Math.round(total / state.knowledge.length);
        const lv = LEVELS.find(l => l.value === Math.min(avg, LEVELS.length - 1));
        return lv || LEVELS[0];
    }

    function getTotalExp() {
        let total = 0;
        for (const k of state.knowledge) total += k.exp;
        return total;
    }

    function hasTalent(id) {
        return state.talents.some(t => t.id === id);
    }

    function addTalent(id) {
        if (hasTalent(id)) return false;
        const talent = TALENTS.find(t => t.id === id);
        if (!talent) return false;
        state.talents.push(talent);
        talent.effect(state);
        return true;
    }

    function removeTalent(id) {
        const idx = state.talents.findIndex(t => t.id === id);
        if (idx === -1) return false;
        state.talents.splice(idx, 1);
        // 重置加成
        state.talentBonus = 1.0;
        state.trainCostMod = 1.0;
        state.luckyBonus = 0;
        state.stressMod = 1.0;
        state.distractedMod = 1.0;
        state.lazyMod = 1.0;
        state.focusMod = 1.0;
        state.impatientMod = 1.0;
        state.steadyBonus = 1.0;
        // 重新应用所有天赋
        for (const t of state.talents) {
            t.effect(state);
        }
        return true;
    }

    function getRandomTalent() {
        return TALENTS[Math.floor(Math.random() * TALENTS.length)];
    }

    // ============================================================
    //  8. 彩蛋系统
    // ============================================================
    const EASTER_EGGS = [
        { id: 'egg1', msg: '🥚 你发现了一本上古神书《算法导论》，知识 +10！', trigger: () => Math.random() < 0.03, effect: (s) => { s.knowledge.forEach(k => k.exp += 10); } },
        { id: 'egg2', msg: '🥚 你在机房发现了一张藏宝图，金钱 +100！', trigger: () => Math.random() < 0.025, effect: (s) => { s.money += 100; } },
        { id: 'egg3', msg: '🥚 一位神秘前辈出现，传授你"大力出奇迹"心法，士气 +20！', trigger: () => Math.random() < 0.02, effect: (s) => { s.morale = clamp(s.morale + 20, 0, 100); } },
        { id: 'egg4', msg: '🥚 你无意间发现了一个系统漏洞，获得 3 枚奖牌！', trigger: () => Math.random() < 0.015, effect: (s) => { s.medal += 3; } },
        { id: 'egg5', msg: '🥚 你遇到了传说中的"OI 之神"，所有知识 +5！', trigger: () => Math.random() < 0.01, effect: (s) => { s.knowledge.forEach(k => k.exp += 5); } },
        { id: 'egg6', msg: '🥚 你在食堂捡到一张饭卡，金钱 +50！', trigger: () => Math.random() < 0.02, effect: (s) => { s.money += 50; } },
    ];

    function checkEasterEgg() {
        for (const egg of EASTER_EGGS) {
            if (state.easterEggs.includes(egg.id)) continue;
            if (egg.trigger()) {
                egg.effect(state);
                state.easterEggs.push(egg.id);
                addLog(egg.msg, 'easter-egg');
                return true;
            }
        }
        return false;
    }

    // ============================================================
    //  9. 特殊事件
    // ============================================================
    const SPECIAL_EVENTS = [
        { type: 'good', weight: 20, msg: '📚 发现珍贵资料，随机知识 +5', effect: (s) => { const d = s.knowledge[Math.floor(Math.random() * s.knowledge.length)]; d.exp += 5; } },
        { type: 'good', weight: 15, msg: '💪 体能训练，精力 +12', effect: (s) => { s.hp = clamp(s.hp + 12, 0, 100); } },
        { type: 'good', weight: 15, msg: '🎯 学长分享经验，士气 +10', effect: (s) => { s.morale = clamp(s.morale + 10, 0, 100); } },
        { type: 'good', weight: 10, msg: '🌟 天赋觉醒！获得随机天赋', effect: (s) => { 
            const talent = getRandomTalent();
            if (addTalent(talent.id)) {
                addLog(`✨ 觉醒天赋：${talent.name} — ${talent.desc}`, 'talent');
            }
        }},
        { type: 'good', weight: 8, msg: '💎 捡到钱袋，金钱 +80', effect: (s) => { s.money += 80; } },
        { type: 'bad', weight: 20, msg: '😷 感冒了，精力 -8', effect: (s) => { s.hp = clamp(s.hp - 8, 0, 100); } },
        { type: 'bad', weight: 15, msg: '😤 被老师批评，士气 -10', effect: (s) => { s.morale = clamp(s.morale - 10, 0, 100); } },
        { type: 'bad', weight: 12, msg: '📉 遇到难题，随机知识 -3', effect: (s) => { const d = s.knowledge[Math.floor(Math.random() * s.knowledge.length)]; d.exp = Math.max(0, d.exp - 3); } },
        { type: 'bad', weight: 10, msg: '💤 睡眠不足，精力 -5，士气 -5', effect: (s) => { s.hp = clamp(s.hp - 5, 0, 100); s.morale = clamp(s.morale - 5, 0, 100); } },
        { type: 'bad', weight: 8, msg: '🌀 天赋消除！失去一个随机天赋', effect: (s) => {
            const goodTalents = state.talents.filter(t => t.type === 'good');
            if (goodTalents.length > 0) {
                const t = goodTalents[Math.floor(Math.random() * goodTalents.length)];
                removeTalent(t.id);
                addLog(`💔 失去天赋：${t.name}`, 'danger');
            }
        }},
        { type: 'mixed', weight: 12, msg: '⚖️ 精力 -3，随机知识 +4', effect: (s) => { s.hp = clamp(s.hp - 3, 0, 100); const d = s.knowledge[Math.floor(Math.random() * s.knowledge.length)]; d.exp += 4; } },
        { type: 'mixed', weight: 8, msg: '🎭 心情波动：士气 -5，金钱 +50', effect: (s) => { s.morale = clamp(s.morale - 5, 0, 100); s.money += 50; } },
    ];

    let eventPool = [];
    SPECIAL_EVENTS.forEach(e => {
        for (let i = 0; i < e.weight; i++) eventPool.push(e);
    });

    function triggerSpecialEvent() {
        if (Math.random() > 0.22) return null;
        const event = eventPool[Math.floor(Math.random() * eventPool.length)];
        event.effect(state);
        return event;
    }

    // ============================================================
    //  10. DOM 缓存
    // ============================================================
    const hpDisplay = document.getElementById('hpDisplay');
    const moneyDisplay = document.getElementById('moneyDisplay');
    const medalDisplay = document.getElementById('medalDisplay');
    const moraleDisplay = document.getElementById('moraleDisplay');
    const avgLevelDisplay = document.getElementById('avgLevelDisplay');
    const yearDisplay = document.getElementById('yearDisplay');
    const seasonDisplay = document.getElementById('seasonDisplay');
    const logArea = document.getElementById('logArea');
    const gameOverMsg = document.getElementById('gameOverMsg');
    const turnCounter = document.getElementById('turnCounter');
    const knowledgeList = document.getElementById('knowledgeList');
    const talentList = document.getElementById('talentList');
    const talentDisplay = document.getElementById('talentDisplay');

    const trainBtn = document.getElementById('trainBtn');
    const contestBtn = document.getElementById('contestBtn');
    const restBtn = document.getElementById('restBtn');
    const researchBtn = document.getElementById('researchBtn');
    const socialBtn = document.getElementById('socialBtn');
    const specialBtn = document.getElementById('specialBtn');
    const awakenBtn = document.getElementById('awakenBtn');
    const resetBtn = document.getElementById('resetBtn');

    // ============================================================
    //  11. UI 更新
    // ============================================================
    function updateUI() {
        hpDisplay.textContent = clamp(state.hp, 0, 100);
        moneyDisplay.textContent = state.money;
        medalDisplay.textContent = state.medal;
        moraleDisplay.textContent = clamp(state.morale, 0, 100);
        const avg = getAvgLevel();
        avgLevelDisplay.textContent = avg.label;
        yearDisplay.textContent = state.yearLabels[state.year] || '高一';
        turnCounter.textContent = `第 ${state.turn} 回合`;
        seasonDisplay.textContent = `📅 ${getCurrentSeasonName(state.year)}`;

        // 天赋显示（顶部横幅）
        if (state.talents.length > 0) {
            talentDisplay.style.display = 'block';
            talentDisplay.innerHTML = '✨ 天赋：' + state.talents.map(t => `${t.name} (${t.desc})`).join(' | ');
            if (state.talents.some(t => t.type === 'bad')) {
                talentDisplay.style.borderColor = '#f78b8b';
            } else {
                talentDisplay.style.borderColor = '#8bf7b0';
            }
        } else {
            talentDisplay.style.display = 'none';
        }

        // 知识列表
        knowledgeList.innerHTML = '';
        for (const k of state.knowledge) {
            const lv = getLevel(k.exp);
            const div = document.createElement('div');
            div.className = 'knowledge-item';
            div.innerHTML = `
                <span class="kname">${k.name}</span>
                <span class="klevel ${getLevelClass(lv.id)}">${lv.label}</span>
            `;
            knowledgeList.appendChild(div);
        }

        // 天赋列表
        talentList.innerHTML = '';
        if (state.talents.length === 0) {
            const empty = document.createElement('div');
            empty.className = 'talent-empty';
            empty.textContent = '暂无天赋';
            talentList.appendChild(empty);
        } else {
            for (const t of state.talents) {
                const div = document.createElement('div');
                div.className = 'talent-item';
                const typeLabel = t.type === 'good' ? '✅' : '⚠️';
                const typeClass = t.type === 'good' ? 'good' : 'bad';
                div.innerHTML = `
                    <span class="tname">${t.name}</span>
                    <span class="ttype ${typeClass}">${typeLabel} ${t.desc}</span>
                `;
                talentList.appendChild(div);
            }
        }

        // 按钮状态
        const btns = [trainBtn, contestBtn, restBtn, researchBtn, socialBtn, specialBtn, awakenBtn];
        btns.forEach(btn => btn.disabled = state.gameOver || state.contestInProgress || !gameStarted);

        // 特殊按钮
        if (!state.gameOver && !state.contestInProgress && gameStarted) {
            const events = getCurrentSeasonEvents(state.turn, state.year);
            const hasEvent = events.length > 0 && !state.triggeredEvents.has(state.turn);
            specialBtn.disabled = !hasEvent;
            if (hasEvent) {
                specialBtn.innerHTML = `🏆 ${events[0].name} <span class="sub">${events[0].desc}</span>`;
            } else {
                const futureSeason = SEASON_CONFIG.find(s => s.year === state.year);
                if (futureSeason) {
                    const future = futureSeason.events.find(e => e.turn > state.turn && !state.triggeredEvents.has(e.turn));
                    if (future) {
                        specialBtn.innerHTML = `🏆 即将到来: ${future.name} <span class="sub">${future.desc}</span>`;
                    } else {
                        specialBtn.innerHTML = `🏆 赛季大赛 <span class="sub">等待下一场...</span>`;
                    }
                } else {
                    specialBtn.innerHTML = `🏆 赛季大赛 <span class="sub">等待下一场...</span>`;
                }
            }
            awakenBtn.disabled = state.money < 100 || state.hp < 20;
        }

        if (state.gameOver) {
            gameOverMsg.style.display = 'block';
        } else {
            gameOverMsg.style.display = 'none';
        }
    }

    function addLog(msg, type = '') {
        const p = document.createElement('p');
        p.textContent = msg;
        if (type) p.classList.add(type);
        logArea.appendChild(p);
        while (logArea.children.length > 35) {
            logArea.removeChild(logArea.firstChild);
        }
        logArea.scrollTop = logArea.scrollHeight;
    }

    // ============================================================
    //  12. 比赛过程模拟
    // ============================================================
    function simulateContest(contestName, callback) {
        if (state.contestInProgress) return;
        state.contestInProgress = true;
        state.contestProgress = 0;
        updateUI();

        addLog(`🏁 ${contestName} 开始！`, 'contest');
        const steps = ['🔍 审题分析...', '✍️ 编写代码...', '🧪 测试数据...', '📤 提交答案...'];
        let stepIndex = 0;

        const interval = setInterval(() => {
            if (stepIndex < steps.length) {
                addLog(`   ${steps[stepIndex]}`, 'highlight');
                stepIndex++;
                state.contestProgress = (stepIndex / steps.length) * 100;
            } else {
                clearInterval(interval);
                state.contestInProgress = false;
                addLog(`✅ ${contestName} 完成！`, 'success');
                updateUI();
                if (callback) callback();
            }
        }, 600);
    }

    // ============================================================
    //  13. 年级晋升
    // ============================================================
    function checkYearUpgrade() {
        if (state.year >= 2) return;
        const threshold = (state.year + 1) * 18;
        if (state.turn > threshold) {
            state.year++;
            addLog(`🎓 升入 ${state.yearLabels[state.year]}！`, 'highlight');
            if (state.year === 2) {
                addLog('🏁 高三冲刺 · 冲击最高荣誉！', 'highlight');
            }
            updateUI();
        }
    }

    // ============================================================
    //  14. 评分系统
    // ============================================================
    function calculateScore() {
        const { medal, money, morale, totalTrain, totalContest, totalResearch, totalSocial, totalRest, totalAwaken } = state;
        let score = 0;
        score += medal * 15;
        score += Math.floor(money / 5);
        score += Math.floor(morale / 2);
        score += getTotalExp();
        const actions = [totalTrain, totalContest, totalResearch, totalSocial, totalRest];
        const nonZero = actions.filter(a => a > 0).length;
        score += nonZero * 10;
        score += totalAwaken * 5;
        if (state.turn >= state.maxTurn) score += 50;
        if (state.year === 2 && state.turn > 40) score += 30;
        score += state.talents.filter(t => t.type === 'good').length * 15;
        score -= state.talents.filter(t => t.type === 'bad').length * 10;
        score += state.easterEggs.length * 5;
        return Math.max(0, score);
    }

    function getScoreGrade(score) {
        if (score >= 500) return { grade: 'SSS', label: '传奇大师', emoji: '👑' };
        if (score >= 400) return { grade: 'SS', label: '顶尖高手', emoji: '🌟' };
        if (score >= 300) return { grade: 'S', label: '优秀选手', emoji: '⭐' };
        if (score >= 200) return { grade: 'A', label: '潜力新星', emoji: '💫' };
        if (score >= 120) return { grade: 'B', label: '稳步成长', emoji: '📈' };
        return { grade: 'C', label: 'OI 探索者', emoji: '🌱' };
    }

    function getEnding() {
        const { medal, morale } = state;
        const score = calculateScore();
        const grade = getScoreGrade(score);
        const totalExp = getTotalExp();

        if (medal >= 30 && totalExp >= 400) return { title: '🏆 IOI 金牌得主', desc: '站上世界之巅！', color: '#ffd700', score, grade };
        if (medal >= 25 && totalExp >= 300) return { title: '🥇 国家队主力', desc: '代表中国出战国际赛场！', color: '#ffb347', score, grade };
        if (totalExp >= 450 && medal < 15) return { title: '🔬 计算机科学家', desc: '学术研究卓越，保送顶尖高校！', color: '#7ec8e3', score, grade };
        if (medal >= 20 && morale >= 85) return { title: '🏅 团队核心', desc: '带领团队屡创佳绩！', color: '#6fcf97', score, grade };
        if (morale >= 90 && totalExp >= 200) return { title: '💪 快乐OIer', desc: '享受编程，平衡生活！', color: '#f2c94a', score, grade };
        if (totalExp < 100 && medal < 8) return { title: '😅 佛系体验', desc: '重在参与，快乐OI！', color: '#a0a0a0', score, grade };
        return { title: '🌟 优秀OIer', desc: '三年生涯，收获满满！', color: '#b3defa', score, grade };
    }

    function triggerEnding() {
        if (state.endingTriggered) return;
        state.endingTriggered = true;
        const ending = getEnding();
        const { grade, label, emoji } = ending.grade;
        const totalExp = getTotalExp();
        gameOverMsg.innerHTML = `
            <div class="ending-title">${ending.title}</div>
            <div style="margin-top:6px;">${ending.desc}</div>
            <div style="margin-top:8px;font-size:18px;font-weight:600;">
                ${emoji} 评分：${grade} (${label}) — ${ending.score} 分
            </div>
            <div style="margin-top:4px;font-size:14px;">
                🏅 ${state.medal} 奖牌 · 💰 ${state.money} 金钱 · 💪 ${state.morale} 士气 · 📊 ${getAvgLevel().label}
            </div>
            <div style="margin-top:2px;font-size:13px;opacity:0.8;">
                训练${state.totalTrain} · 比赛${state.totalContest} · 研究${state.totalResearch} · 社交${state.totalSocial} · 休息${state.totalRest} · 觉醒${state.totalAwaken}
            </div>
            <div style="margin-top:4px;font-size:12px;opacity:0.6;">
                总经验 ${totalExp} · 天赋 ${state.talents.length} 个
                ${state.easterEggs.length > 0 ? ` · 🥚 彩蛋 ${state.easterEggs.length} 个` : ''}
            </div>
        `;
        gameOverMsg.style.borderColor = ending.color;
        gameOverMsg.style.background = currentTheme === 'dark' ? '#1a2a2a' : '#f0e8d8';
        addLog(`🏁 结局达成: ${ending.title} (评分 ${grade})`, 'highlight');
        updateUI();
    }

    // ============================================================
    //  15. 核心行动
    // ============================================================
    function getCost(base) {
        let cost = base * state.lazyMod;
        return Math.round(cost);
    }

    function actionTrain() {
        if (state.gameOver || state.contestInProgress || !gameStarted) return;
        const cost = getCost(30);
        if (state.money < cost) { addLog('❌ 金钱不足！', 'danger'); return; }
        if (state.hp < 10) { addLog('❌ 精力不足，无法训练！', 'danger'); return; }

        state.money -= cost;
        state.hp = clamp(state.hp - 6 * state.stressMod, 0, 100);
        state.morale = clamp(state.morale - 2, 0, 100);
        state.totalTrain++;

        let target = state.trainTarget % state.knowledge.length;
        const baseGain = Math.floor(Math.random() * 8 + 5);
        const gain = Math.floor(baseGain * state.talentBonus * state.steadyBonus * (1 - (state.distractedMod - 1) * 0.5));
        state.knowledge[target].exp += gain;
        state.trainTarget++;

        const lv = getLevel(state.knowledge[target].exp);
        addLog(`📖 训练 ${state.knowledge[target].name} +${gain} 经验 → ${lv.label} (💰-${cost})`, 'knowledge-up');

        // 训练中随机觉醒/消除天赋
        if (Math.random() < 0.06) {
            const talent = getRandomTalent();
            if (talent.type === 'good' && !hasTalent(talent.id)) {
                if (addTalent(talent.id)) {
                    addLog(`✨ 训练中觉醒天赋：${talent.name}！`, 'talent');
                }
            } else if (talent.type === 'bad' && hasTalent(talent.id)) {
                if (removeTalent(talent.id)) {
                    addLog(`💪 训练中消除负面天赋：${talent.name}！`, 'success');
                }
            }
        }

        advanceTurn();
    }

    function actionContest() {
        if (state.gameOver || state.contestInProgress || !gameStarted) return;
        const cost = getCost(50);
        if (state.money < cost) { addLog('❌ 金钱不足！', 'danger'); return; }

        state.money -= cost;
        simulateContest('常规赛', () => {
            state.hp = clamp(state.hp - 10 * state.stressMod, 0, 100);
            state.morale = clamp(state.morale - 3, 0, 100);
            state.totalContest++;

            const totalExp = getTotalExp();
            const kf = Math.min(1, totalExp / 300);
            const mf = Math.min(1, state.morale / 80);
            let chance = (0.15 + kf * 0.5 + mf * 0.15) * state.impatientMod;
            if (state.year === 2) chance += 0.08;

            const roll = Math.random();
            let gain = 0, msg = '';
            if (roll < chance * 0.35) { gain = 1 + state.luckyBonus; msg = '🥉 铜牌！'; }
            else if (roll < chance * 0.65) { gain = 2 + state.luckyBonus; msg = '🥈 银牌！'; }
            else if (roll < chance) { gain = 3 + state.luckyBonus; msg = '🥇 金牌！'; }
            else { msg = '😞 未获奖牌...'; }

            if (gain > 0) {
                state.medal += gain;
                state.morale = clamp(state.morale + 5, 0, 100);
                state.money += gain * 20;
                addLog(`⚔️ 常规赛 ${msg} 获得 ${gain} 奖牌，金钱 +${gain*20}`, 'success');
            } else {
                state.morale = clamp(state.morale - 5, 0, 100);
                addLog(`⚔️ 常规赛 ${msg}`, 'danger');
            }
            if (Math.random() < 0.04 && state.hp > 0) {
                const injury = Math.floor(Math.random() * 8) + 4;
                state.hp = clamp(state.hp - injury, 0, 100);
                addLog(`😵 受伤，额外 -${injury} 精力`, 'danger');
            }
            advanceTurn();
        });
    }

    function actionRest() {
        if (state.gameOver || state.contestInProgress || !gameStarted) return;
        const heal = Math.floor(Math.random() * 18) + 18;
        const moraleGain = Math.floor(Math.random() * 8) + 5;
        state.hp = clamp(state.hp + heal, 0, 100);
        state.morale = clamp(state.morale + moraleGain, 0, 100);
        state.totalRest++;
        addLog(`😴 休息 +${heal} 精力，+${moraleGain} 士气`);
        if (Math.random() < 0.10) {
            const learn = Math.floor(Math.random() * 4) + 2;
            const d = state.knowledge[Math.floor(Math.random() * state.knowledge.length)];
            d.exp += learn;
            addLog(`📖 休息时看书 ${d.name} +${learn} 经验`, 'highlight');
        }
        advanceTurn();
    }

    function actionResearch() {
        if (state.gameOver || state.contestInProgress || !gameStarted) return;
        const cost = getCost(80);
        if (state.money < cost) { addLog('❌ 金钱不足！', 'danger'); return; }
        if (state.hp < 15) { addLog('❌ 精力不足！', 'danger'); return; }

        state.money -= cost;
        state.hp = clamp(state.hp - 12 * state.stressMod, 0, 100);
        state.morale = clamp(state.morale - 4, 0, 100);
        state.totalResearch++;

        const baseGain = Math.floor(Math.random() * 15 + 10);
        const gain = Math.floor(baseGain * state.talentBonus * state.focusMod * (1 - (state.distractedMod - 1) * 0.3));
        for (const k of state.knowledge) {
            k.exp += Math.floor(gain / state.knowledge.length);
        }
        const extra = Math.floor(Math.random() * 5) + 2;
        const d = state.knowledge[Math.floor(Math.random() * state.knowledge.length)];
        d.exp += extra;

        addLog(`🔬 研究 +${gain} 总经验，${d.name} +${extra} (💰-${cost})`, 'knowledge-up');

        if (Math.random() < 0.10) {
            const talent = getRandomTalent();
            if (talent.type === 'good' && !hasTalent(talent.id)) {
                if (addTalent(talent.id)) {
                    addLog(`✨ 研究中觉醒天赋：${talent.name}！`, 'talent');
                }
            }
        }

        advanceTurn();
    }

    function actionSocial() {
        if (state.gameOver || state.contestInProgress || !gameStarted) return;
        const cost = getCost(40);
        if (state.money < cost) { addLog('❌ 金钱不足！', 'danger'); return; }

        state.money -= cost;
        state.morale = clamp(state.morale + 15, 0, 100);
        state.totalSocial++;
        const learn = Math.floor(Math.random() * 5) + 2;
        const d = state.knowledge[Math.floor(Math.random() * state.knowledge.length)];
        d.exp += learn;
        addLog(`🤝 社交 ${d.name} +${learn} 经验，士气 +15 (💰-${cost})`);
        if (Math.random() < 0.08) {
            const extra = Math.floor(Math.random() * 2) + 1;
            state.medal += extra;
            addLog(`🎁 朋友赠送 ${extra} 枚奖牌！`, 'success');
        }
        if (Math.random() < 0.12) {
            const cost2 = Math.floor(Math.random() * 4) + 2;
            state.hp = clamp(state.hp - cost2, 0, 100);
            addLog(`😅 社交有点累，精力 -${cost2}`);
        }
        advanceTurn();
    }

    function actionSpecial() {
        if (state.gameOver || state.contestInProgress || !gameStarted) return;
        const events = getCurrentSeasonEvents(state.turn, state.year);
        if (events.length === 0 || state.triggeredEvents.has(state.turn)) {
            addLog('⏳ 当前没有可参加的大赛', 'danger');
            return;
        }

        const event = events[0];
        const totalExp = getTotalExp();
        if (totalExp < event.knowledgeReq) {
            addLog(`❌ 知识不足 (需要 ${event.knowledgeReq})，无法参加 ${event.name}`, 'danger');
            return;
        }

        const cost = getCost(60);
        if (state.money < cost) { addLog('❌ 金钱不足！', 'danger'); return; }
        state.money -= cost;

        simulateContest(event.name, () => {
            state.hp = clamp(state.hp - 14 * state.stressMod, 0, 100);
            state.morale = clamp(state.morale - 2, 0, 100);

            const excess = totalExp - event.knowledgeReq;
            const bonus = Math.floor(excess / 25);
            let medalGain = event.medalBase + bonus + Math.floor(Math.random() * 3) + state.luckyBonus;
            if (state.morale > 70) medalGain += 1;
            medalGain = Math.max(1, medalGain);

            state.medal += medalGain;
            state.triggeredEvents.add(state.turn);
            state.money += medalGain * 30;

            const knowledgeBoost = Math.floor(medalGain * 4) + 5;
            for (const k of state.knowledge) {
                k.exp += Math.floor(knowledgeBoost / state.knowledge.length);
            }

            addLog(`🏆 ${event.name} 完成！获得 ${medalGain} 奖牌，金钱 +${medalGain*30}`, 'contest');
            addLog(`📌 ${event.desc}`, 'highlight');
            advanceTurn();
        });
    }

    function actionAwaken() {
        if (state.gameOver || state.contestInProgress || !gameStarted) return;
        if (state.money < 100) { addLog('❌ 金钱不足！需要 $100', 'danger'); return; }
        if (state.hp < 20) { addLog('❌ 精力不足 (需要 ≥20)！', 'danger'); return; }

        state.money -= 100;
        state.hp = clamp(state.hp - 8, 0, 100);
        state.totalAwaken++;

        const success = Math.random() < 0.40;
        if (success) {
            const talent = getRandomTalent();
            if (talent.type === 'good' && !hasTalent(talent.id)) {
                if (addTalent(talent.id)) {
                    addLog(`✨ 觉醒成功！获得天赋：${talent.name} — ${talent.desc}`, 'talent');
                } else {
                    addLog('⚠️ 已有该天赋，觉醒失败，金钱退还 $50', 'danger');
                    state.money += 50;
                }
            } else if (talent.type === 'bad' && hasTalent(talent.id)) {
                removeTalent(talent.id);
                addLog(`💪 消除了负面天赋：${talent.name}！`, 'success');
            } else {
                const goodTalents = TALENTS.filter(t => t.type === 'good');
                const t = goodTalents[Math.floor(Math.random() * goodTalents.length)];
                if (!hasTalent(t.id)) {
                    addTalent(t.id);
                    addLog(`✨ 觉醒成功！获得天赋：${t.name} — ${t.desc}`, 'talent');
                } else {
                    addLog('⚠️ 已有该天赋，觉醒失败，金钱退还 $50', 'danger');
                    state.money += 50;
                }
            }
        } else {
            addLog('💔 觉醒失败... 继续努力！', 'danger');
        }
        advanceTurn();
    }

    // ============================================================
    //  16. 回合推进
    // ============================================================
    function advanceTurn() {
        if (state.gameOver) return;

        state.turn++;

        if (state.hp > 0) {
            const decay = Math.floor(Math.random() * 3) + 1;
            state.hp = clamp(state.hp - decay, 0, 100);
            if (state.hp < 20 && state.hp > 0 && !state.gameOver) {
                addLog(`⚠️ 精力偏低 (${state.hp})，注意休息`, 'danger');
            }
        }
        if (state.morale > 0 && state.turn % 2 === 0) {
            state.morale = clamp(state.morale - 1, 0, 100);
        }

        checkYearUpgrade();
        updateUI();

        let over = false;
        if (state.hp <= 0) {
            state.gameOver = true;
            gameOverMsg.innerHTML = `<div class="ending-title">💔 精力耗尽</div><div>OI 生涯因过度疲劳而结束...</div>`;
            addLog('💔 精力耗尽，生涯结束', 'danger');
            over = true;
        } else if (state.turn > state.maxTurn) {
            state.gameOver = true;
            over = true;
            triggerEnding();
        } else if (state.year === 2 && state.turn > 42) {
            state.gameOver = true;
            over = true;
            triggerEnding();
        }

        if (over) {
            updateUI();
            return;
        }

        if (state.turn % 4 === 0 && !state.gameOver && gameStarted) {
            const event = triggerSpecialEvent();
            if (event) {
                addLog(event.msg, event.type === 'good' ? 'success' : event.type === 'bad' ? 'danger' : 'highlight');
            }
            updateUI();
        }

        if (state.turn % 3 === 0 && !state.gameOver && gameStarted) {
            checkEasterEgg();
        }

        if (!state.gameOver && gameStarted) {
            const upcoming = getCurrentSeasonEvents(state.turn, state.year);
            if (upcoming.length > 0 && !state.triggeredEvents.has(state.turn)) {
                const ev = upcoming[0];
                const totalExp = getTotalExp();
                if (totalExp >= ev.knowledgeReq) {
                    addLog(`📢 赛季大赛 ${ev.name} 已开启！点击「赛季大赛」参加`, 'highlight');
                } else {
                    addLog(`📢 ${ev.name} 即将开启 (需知识 ${ev.knowledgeReq})，继续努力！`, 'highlight');
                }
            }
        }
        updateUI();
    }

    // ============================================================
    //  17. 重置游戏
    // ============================================================
    function resetGame() {
        state.hp = 100;
        state.morale = 80;
        state.medal = 0;
        state.money = 500;
        state.year = 0;
        state.turn = 1;
        state.gameOver = false;
        state.endingTriggered = false;
        state.knowledge = KNOWLEDGE_DOMAINS.map(d => ({ id: d.id, name: d.name, exp: 0 }));
        state.talents = [];
        state.talentBonus = 1.0;
        state.trainCostMod = 1.0;
        state.luckyBonus = 0;
        state.stressMod = 1.0;
        state.distractedMod = 1.0;
        state.lazyMod = 1.0;
        state.focusMod = 1.0;
        state.impatientMod = 1.0;
        state.steadyBonus = 1.0;
        state.totalTrain = 0;
        state.totalContest = 0;
        state.totalRest = 0;
        state.totalResearch = 0;
        state.totalSocial = 0;
        state.totalAwaken = 0;
        state.triggeredEvents = new Set();
        state.contestInProgress = false;
        state.easterEggs = [];
        state.trainTarget = 0;

        logArea.innerHTML = '';
        gameOverMsg.style.display = 'none';
        gameOverMsg.innerHTML = '';
        updateUI();

        [trainBtn, contestBtn, restBtn, researchBtn, socialBtn, specialBtn, awakenBtn].forEach(btn => {
            btn.disabled = true;
        });

        showMenu();
    }

    // ============================================================
    //  18. 初始化
    // ============================================================
    function init() {
        trainBtn.addEventListener('click', actionTrain);
        contestBtn.addEventListener('click', actionContest);
        restBtn.addEventListener('click', actionRest);
        researchBtn.addEventListener('click', actionResearch);
        socialBtn.addEventListener('click', actionSocial);
        specialBtn.addEventListener('click', actionSpecial);
        awakenBtn.addEventListener('click', actionAwaken);
        resetBtn.addEventListener('click', resetGame);

        startGameBtn.addEventListener('click', function() {
            resetGame();
            hideMenu();
            gameStarted = true;
            state.gameOver = false;

            logArea.innerHTML = '';
            addLog('🧑‍💻 OI 生涯 · 天赋与金钱系统', 'highlight');
            addLog('⏱️ 55 回合 (约 12-15 分钟)');
            addLog('💰 训练、比赛、研究需要消耗金钱');
            addLog('✨ 觉醒天赋需要 $100，成功率 40%');
            addLog('🎯 训练中也可能随机觉醒或消除天赋！');

            [trainBtn, contestBtn, restBtn, researchBtn, socialBtn, specialBtn, awakenBtn].forEach(btn => {
                btn.disabled = false;
            });

            updateUI();
        });

        resetGame();
        showMenu();
        updateUI();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();