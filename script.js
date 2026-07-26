// script.js - 完整的游戏逻辑（修复版）
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
        // 确保按钮可点击
        startGameBtn.disabled = false;
    }

    function hideMenu() {
        menuOverlay.classList.add('hidden');
        gameStarted = true;
    }

    // ============================================================
    //  3. 赛季 / 比赛配置
    // ============================================================
    const SEASON_CONFIG = [
        { year: 0, startTurn: 1, endTurn: 18, name: '高一赛季', events: [
            { turn: 3, name: 'CSP 第一轮', medalBase: 2, knowledgeReq: 20, desc: 'CSP 入门级' },
            { turn: 6, name: 'NOIP 初赛', medalBase: 3, knowledgeReq: 35, desc: '全国青少年信息学奥林匹克联赛' },
            { turn: 9, name: '省选 第一轮', medalBase: 4, knowledgeReq: 55, desc: '省级选拔' },
            { turn: 12, name: 'NOI 冬令营', medalBase: 5, knowledgeReq: 70, desc: '全国青少年信息学奥林匹克冬令营' },
            { turn: 15, name: '春季训练营', medalBase: 3, knowledgeReq: 50, desc: '春季集训' },
        ]},
        { year: 1, startTurn: 19, endTurn: 34, name: '高二赛季', events: [
            { turn: 21, name: 'CSP 第二轮', medalBase: 3, knowledgeReq: 55, desc: 'CSP 提高级' },
            { turn: 24, name: 'NOIP 复赛', medalBase: 4, knowledgeReq: 75, desc: 'NOIP 提高组' },
            { turn: 27, name: '省选 第二轮', medalBase: 5, knowledgeReq: 95, desc: '省队选拔' },
            { turn: 30, name: 'NOI 夏令营', medalBase: 6, knowledgeReq: 120, desc: 'NOI 夏令营' },
            { turn: 33, name: 'APIO 亚太赛', medalBase: 5, knowledgeReq: 100, desc: 'Asia-Pacific Informatics Olympiad' },
        ]},
        { year: 2, startTurn: 35, endTurn: 55, name: '高三赛季', events: [
            { turn: 37, name: 'NOI 全国赛', medalBase: 7, knowledgeReq: 140, desc: '全国青少年信息学奥林匹克竞赛' },
            { turn: 41, name: 'CTS 国家队选拔', medalBase: 8, knowledgeReq: 170, desc: 'China Team Selection' },
            { turn: 44, name: 'CTT 冬令营', medalBase: 6, knowledgeReq: 160, desc: '中国国家队冬令营' },
            { turn: 48, name: 'IOI 国际赛', medalBase: 10, knowledgeReq: 220, desc: 'International Olympiad in Informatics' },
            { turn: 52, name: 'EGOI 欧洲女子赛', medalBase: 7, knowledgeReq: 180, desc: 'European Girls\' Olympiad' },
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
    //  4. 特殊事件
    // ============================================================
    const SPECIAL_EVENTS = [
        { type: 'good', weight: 30, msg: '📚 图书馆发现珍贵资料，知识 +8', effect: (s) => { s.knowledge += 8; } },
        { type: 'good', weight: 25, msg: '💪 体能训练效果显著，精力 +12', effect: (s) => { s.hp = clamp(s.hp + 12, 0, 100); } },
        { type: 'good', weight: 20, msg: '🎯 学长分享经验，士气 +10', effect: (s) => { s.morale = clamp(s.morale + 10, 0, 100); } },
        { type: 'good', weight: 15, msg: '🏅 收到意外礼物，奖牌 +1', effect: (s) => { s.medal += 1; } },
        { type: 'good', weight: 10, msg: '🌟 编程天赋觉醒，知识 +5，士气 +5', effect: (s) => { s.knowledge += 5; s.morale = clamp(s.morale + 5, 0, 100); } },
        { type: 'bad', weight: 20, msg: '😷 感冒了，精力 -8', effect: (s) => { s.hp = clamp(s.hp - 8, 0, 100); } },
        { type: 'bad', weight: 18, msg: '😤 被老师批评，士气 -10', effect: (s) => { s.morale = clamp(s.morale - 10, 0, 100); } },
        { type: 'bad', weight: 15, msg: '📉 题目太难，知识 -3', effect: (s) => { s.knowledge = Math.max(0, s.knowledge - 3); } },
        { type: 'bad', weight: 12, msg: '💤 睡眠不足，精力 -5，士气 -5', effect: (s) => { s.hp = clamp(s.hp - 5, 0, 100); s.morale = clamp(s.morale - 5, 0, 100); } },
        { type: 'bad', weight: 10, msg: '🔧 电脑故障，损失比赛机会', effect: (s) => { /* 仅日志 */ } },
        { type: 'mixed', weight: 15, msg: '⚖️ 平衡调整：精力 -3，知识 +4', effect: (s) => { s.hp = clamp(s.hp - 3, 0, 100); s.knowledge += 4; } },
        { type: 'mixed', weight: 10, msg: '🎭 心情波动：士气 -5，奖牌 +1', effect: (s) => { s.morale = clamp(s.morale - 5, 0, 100); s.medal += 1; } },
    ];

    let eventPool = [];
    SPECIAL_EVENTS.forEach(e => {
        for (let i = 0; i < e.weight; i++) eventPool.push(e);
    });

    function triggerSpecialEvent(state) {
        if (Math.random() > 0.18) return null;
        const event = eventPool[Math.floor(Math.random() * eventPool.length)];
        event.effect(state);
        return event;
    }

    // ============================================================
    //  5. 游戏状态
    // ============================================================
    const state = {
        hp: 100,
        knowledge: 15,
        medal: 0,
        morale: 80,
        year: 0,
        turn: 1,
        gameOver: false,
        maxTurn: 55,
        yearLabels: ['高一', '高二', '高三'],
        totalTrain: 0,
        totalContest: 0,
        totalRest: 0,
        totalResearch: 0,
        totalSocial: 0,
        specialUsed: false,
        endingTriggered: false,
        triggeredEvents: new Set(),
        contestInProgress: false,
        contestProgress: 0,
    };

    function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

    // ============================================================
    //  6. DOM 缓存
    // ============================================================
    const hpDisplay = document.getElementById('hpDisplay');
    const knowledgeDisplay = document.getElementById('knowledgeDisplay');
    const medalDisplay = document.getElementById('medalDisplay');
    const moraleDisplay = document.getElementById('moraleDisplay');
    const yearDisplay = document.getElementById('yearDisplay');
    const seasonDisplay = document.getElementById('seasonDisplay');
    const logArea = document.getElementById('logArea');
    const gameOverMsg = document.getElementById('gameOverMsg');
    const turnCounter = document.getElementById('turnCounter');

    const trainBtn = document.getElementById('trainBtn');
    const contestBtn = document.getElementById('contestBtn');
    const restBtn = document.getElementById('restBtn');
    const researchBtn = document.getElementById('researchBtn');
    const socialBtn = document.getElementById('socialBtn');
    const specialBtn = document.getElementById('specialBtn');
    const resetBtn = document.getElementById('resetBtn');

    // ============================================================
    //  7. UI 更新
    // ============================================================
    function updateUI() {
        hpDisplay.textContent = clamp(state.hp, 0, 100);
        knowledgeDisplay.textContent = state.knowledge;
        medalDisplay.textContent = state.medal;
        moraleDisplay.textContent = clamp(state.morale, 0, 100);
        yearDisplay.textContent = state.yearLabels[state.year] || '高一';
        turnCounter.textContent = `第 ${state.turn} 回合`;
        seasonDisplay.textContent = `📅 ${getCurrentSeasonName(state.year)}`;

        const btns = [trainBtn, contestBtn, restBtn, researchBtn, socialBtn, specialBtn];
        btns.forEach(btn => btn.disabled = state.gameOver || state.contestInProgress || !gameStarted);

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
        while (logArea.children.length > 30) {
            logArea.removeChild(logArea.firstChild);
        }
        logArea.scrollTop = logArea.scrollHeight;
    }

    // ============================================================
    //  8. 比赛过程模拟
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
        }, 700);
    }

    // ============================================================
    //  9. 年级晋升
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
    //  10. 评分系统
    // ============================================================
    function calculateScore() {
        const { medal, knowledge, morale, totalTrain, totalContest, totalResearch, totalSocial, totalRest } = state;
        let score = 0;
        score += medal * 15;
        score += Math.floor(knowledge / 2);
        score += Math.floor(morale / 2);
        const actions = [totalTrain, totalContest, totalResearch, totalSocial, totalRest];
        const nonZero = actions.filter(a => a > 0).length;
        score += nonZero * 8;
        if (state.turn >= state.maxTurn) score += 30;
        if (state.year === 2 && state.turn > 40) score += 20;
        return score;
    }

    function getScoreGrade(score) {
        if (score >= 300) return { grade: 'SSS', label: '传奇大师', emoji: '👑' };
        if (score >= 240) return { grade: 'SS', label: '顶尖高手', emoji: '🌟' };
        if (score >= 180) return { grade: 'S', label: '优秀选手', emoji: '⭐' };
        if (score >= 120) return { grade: 'A', label: '潜力新星', emoji: '💫' };
        if (score >= 80) return { grade: 'B', label: '稳步成长', emoji: '📈' };
        return { grade: 'C', label: 'OI 探索者', emoji: '🌱' };
    }

    // ============================================================
    //  11. 多结局系统
    // ============================================================
    function getEnding() {
        const { medal, knowledge, morale } = state;
        const score = calculateScore();
        const grade = getScoreGrade(score);

        if (medal >= 28 && knowledge >= 280) return { title: '🏆 IOI 金牌得主', desc: '站上世界之巅！', color: '#ffd700', score: score, grade: grade };
        if (medal >= 22 && knowledge >= 220) return { title: '🥇 国家队主力', desc: '代表中国出战国际赛场！', color: '#ffb347', score: score, grade: grade };
        if (knowledge >= 300 && medal < 12) return { title: '🔬 计算机科学家', desc: '学术研究卓越，保送顶尖高校！', color: '#7ec8e3', score: score, grade: grade };
        if (medal >= 18 && morale >= 85) return { title: '🏅 团队核心', desc: '带领团队屡创佳绩！', color: '#6fcf97', score: score, grade: grade };
        if (morale >= 90 && knowledge >= 140) return { title: '💪 快乐OIer', desc: '享受编程，平衡生活！', color: '#f2c94a', score: score, grade: grade };
        if (knowledge < 70 && medal < 6) return { title: '😅 佛系体验', desc: '重在参与，快乐OI！', color: '#a0a0a0', score: score, grade: grade };
        return { title: '🌟 优秀OIer', desc: '三年生涯，收获满满！', color: '#b3defa', score: score, grade: grade };
    }

    function triggerEnding() {
        if (state.endingTriggered) return;
        state.endingTriggered = true;
        const ending = getEnding();
        const { grade, label, emoji } = ending.grade;
        gameOverMsg.innerHTML = `
            <div class="ending-title">${ending.title}</div>
            <div style="margin-top:6px;">${ending.desc}</div>
            <div style="margin-top:8px;font-size:18px;font-weight:600;">
                ${emoji} 评分：${grade} (${label}) — ${ending.score} 分
            </div>
            <div style="margin-top:4px;font-size:14px;">🏅 ${state.medal} 奖牌 · 📚 ${state.knowledge} 知识 · 💪 ${state.morale} 士气</div>
            <div style="margin-top:2px;font-size:13px;opacity:0.8;">
                训练${state.totalTrain} · 比赛${state.totalContest} · 研究${state.totalResearch} · 社交${state.totalSocial} · 休息${state.totalRest}
            </div>
        `;
        gameOverMsg.style.borderColor = ending.color;
        gameOverMsg.style.background = currentTheme === 'dark' ? '#1a2a2a' : '#f0e8d8';
        addLog(`🏁 结局达成: ${ending.title} (评分 ${grade})`, 'highlight');
        updateUI();
    }

    // ============================================================
    //  12. 核心行动
    // ============================================================
    function actionTrain() {
        if (state.gameOver || state.contestInProgress || !gameStarted) return;
        const gain = Math.floor(Math.random() * 10) + 6;
        const cost = Math.floor(Math.random() * 6) + 5;
        state.knowledge += gain;
        state.hp = clamp(state.hp - cost, 0, 100);
        state.morale = clamp(state.morale - 2, 0, 100);
        state.totalTrain++;
        addLog(`📚 训练 +${gain} 知识，精力 -${cost}，士气 -2`);
        if (Math.random() < 0.12) {
            const extra = Math.floor(Math.random() * 6) + 3;
            state.knowledge += extra;
            addLog(`✨ 灵感迸发！额外 +${extra} 知识`, 'highlight');
        }
        advanceTurn();
    }

    function actionContest() {
        if (state.gameOver || state.contestInProgress || !gameStarted) return;
        simulateContest('常规赛', () => {
            const cost = Math.floor(Math.random() * 10) + 8;
            state.hp = clamp(state.hp - cost, 0, 100);
            state.morale = clamp(state.morale - 3, 0, 100);
            state.totalContest++;

            const kf = Math.min(1, state.knowledge / 100);
            const mf = Math.min(1, state.morale / 80);
            let chance = 0.15 + kf * 0.5 + mf * 0.15;
            if (state.year === 2) chance += 0.08;

            const roll = Math.random();
            let gain = 0, msg = '';
            if (roll < chance * 0.35) { gain = 1; msg = '🥉 铜牌！'; }
            else if (roll < chance * 0.65) { gain = 2; msg = '🥈 银牌！'; }
            else if (roll < chance) { gain = 3; msg = '🥇 金牌！'; }
            else { msg = '😞 未获奖牌...'; }

            if (gain > 0) {
                state.medal += gain;
                state.morale = clamp(state.morale + 5, 0, 100);
                addLog(`⚔️ 常规赛 精力 -${cost}，${msg} 士气 +5`, 'success');
            } else {
                state.morale = clamp(state.morale - 5, 0, 100);
                addLog(`⚔️ 常规赛 精力 -${cost}，${msg} 士气 -5`, 'danger');
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
        if (Math.random() < 0.12) {
            const learn = Math.floor(Math.random() * 5) + 2;
            state.knowledge += learn;
            addLog(`📖 休息时看书 +${learn} 知识`, 'highlight');
        }
        advanceTurn();
    }

    function actionResearch() {
        if (state.gameOver || state.contestInProgress || !gameStarted) return;
        const cost = Math.floor(Math.random() * 12) + 10;
        state.hp = clamp(state.hp - cost, 0, 100);
        state.morale = clamp(state.morale - 4, 0, 100);
        state.totalResearch++;
        const gain = Math.floor(Math.random() * 18) + 12;
        state.knowledge += gain;
        addLog(`🔬 深入研究 +${gain} 知识，精力 -${cost}，士气 -4`);
        if (Math.random() < 0.15) {
            const extra = Math.floor(Math.random() * 10) + 6;
            state.knowledge += extra;
            state.morale = clamp(state.morale + 10, 0, 100);
            addLog(`💡 研究突破！额外 +${extra} 知识，士气 +10`, 'success');
        }
        advanceTurn();
    }

    function actionSocial() {
        if (state.gameOver || state.contestInProgress || !gameStarted) return;
        state.morale = clamp(state.morale + 15, 0, 100);
        state.totalSocial++;
        const learn = Math.floor(Math.random() * 6) + 2;
        state.knowledge += learn;
        addLog(`🤝 社交 +${learn} 知识，士气 +15`);
        if (Math.random() < 0.1) {
            const extra = Math.floor(Math.random() * 3) + 1;
            state.medal += extra;
            addLog(`🎁 朋友赠送 ${extra} 枚奖牌！`, 'success');
        }
        if (Math.random() < 0.15) {
            const cost = Math.floor(Math.random() * 5) + 2;
            state.hp = clamp(state.hp - cost, 0, 100);
            addLog(`😅 社交有点累，精力 -${cost}`);
        }
        advanceTurn();
    }

    // ============================================================
    //  13. 赛季大赛
    // ============================================================
    function actionSpecial() {
        if (state.gameOver || state.contestInProgress || !gameStarted) return;
        const events = getCurrentSeasonEvents(state.turn, state.year);
        if (events.length === 0 || state.triggeredEvents.has(state.turn)) {
            addLog('⏳ 当前没有可参加的大赛', 'danger');
            return;
        }

        const event = events[0];
        if (state.knowledge < event.knowledgeReq) {
            addLog(`❌ 知识不足 (需要 ${event.knowledgeReq})，无法参加 ${event.name}`, 'danger');
            return;
        }

        simulateContest(event.name, () => {
            const cost = Math.floor(Math.random() * 12) + 12;
            state.hp = clamp(state.hp - cost, 0, 100);
            state.morale = clamp(state.morale - 2, 0, 100);

            const excess = state.knowledge - event.knowledgeReq;
            const bonus = Math.floor(excess / 20);
            let medalGain = event.medalBase + bonus + Math.floor(Math.random() * 3);
            if (state.morale > 70) medalGain += 1;
            medalGain = Math.max(1, medalGain);

            state.medal += medalGain;
            state.triggeredEvents.add(state.turn);

            const knowledgeBoost = Math.floor(medalGain * 3) + 5;
            state.knowledge += knowledgeBoost;

            addLog(`🏆 ${event.name} 完成！获得 ${medalGain} 枚奖牌，知识 +${knowledgeBoost}`, 'contest');
            addLog(`📌 ${event.desc} — 精力 -${cost}`, 'highlight');
            advanceTurn();
        });
    }

    // ============================================================
    //  14. 回合推进
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

        if (state.turn % 5 === 0 && !state.gameOver && gameStarted) {
            const event = triggerSpecialEvent(state);
            if (event) {
                addLog(event.msg, event.type === 'good' ? 'success' : event.type === 'bad' ? 'danger' : 'highlight');
            }
            updateUI();
        }

        if (!state.gameOver && gameStarted) {
            const upcoming = getCurrentSeasonEvents(state.turn, state.year);
            if (upcoming.length > 0 && !state.triggeredEvents.has(state.turn)) {
                const ev = upcoming[0];
                if (state.knowledge >= ev.knowledgeReq) {
                    addLog(`📢 赛季大赛 ${ev.name} 已开启！点击「赛季大赛」参加`, 'highlight');
                } else {
                    addLog(`📢 ${ev.name} 即将开启 (需知识 ${ev.knowledgeReq})，继续努力！`, 'highlight');
                }
            }
        }
        updateUI();
    }

    // ============================================================
    //  15. 重置游戏
    // ============================================================
    function resetGame() {
        state.hp = 100;
        state.knowledge = 15;
        state.medal = 0;
        state.morale = 80;
        state.year = 0;
        state.turn = 1;
        state.gameOver = false;
        state.endingTriggered = false;
        state.totalTrain = 0;
        state.totalContest = 0;
        state.totalRest = 0;
        state.totalResearch = 0;
        state.totalSocial = 0;
        state.triggeredEvents = new Set();
        state.contestInProgress = false;

        logArea.innerHTML = '';
        gameOverMsg.style.display = 'none';
        gameOverMsg.innerHTML = '';
        updateUI();

        // 重置按钮状态
        [trainBtn, contestBtn, restBtn, researchBtn, socialBtn, specialBtn].forEach(btn => {
            btn.disabled = true;
        });
        
        // 显示菜单
        showMenu();
    }

    // ============================================================
    //  16. 初始化
    // ============================================================
    function init() {
        // 绑定按钮事件
        trainBtn.addEventListener('click', actionTrain);
        contestBtn.addEventListener('click', actionContest);
        restBtn.addEventListener('click', actionRest);
        researchBtn.addEventListener('click', actionResearch);
        socialBtn.addEventListener('click', actionSocial);
        specialBtn.addEventListener('click', actionSpecial);
        resetBtn.addEventListener('click', function() {
            resetGame();
            // 重置后显示菜单
            showMenu();
        });

        // 开始游戏按钮
        startGameBtn.addEventListener('click', function() {
            console.log('开始游戏按钮被点击！');
            // 重置状态
            resetGame();
            // 隐藏菜单，开始游戏
            hideMenu();
            gameStarted = true;
            state.gameOver = false;
            
            // 清空日志并显示欢迎信息
            logArea.innerHTML = '';
            addLog('🧑‍💻 OI 生涯 · 赛季赛制', 'highlight');
            addLog('⏱️ 55 回合 (约 10-12 分钟)');
            addLog('📅 赛季大赛: CSP → NOIP → 省选 → NOI → 冬/夏令营 → IOI');
            addLog('🏆 把握每个赛季的关键比赛！');
            
            // 启用所有按钮
            [trainBtn, contestBtn, restBtn, researchBtn, socialBtn, specialBtn].forEach(btn => {
                btn.disabled = false;
            });
            
            updateUI();
        });

        // 初始状态：显示菜单，所有按钮禁用
        resetGame();
        showMenu();
        updateUI();
        
        console.log('游戏已初始化，菜单已显示');
    }

    // 页面加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();