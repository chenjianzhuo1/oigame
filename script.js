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
    //  2. 人物配置
    // ============================================================
    const CHARACTERS = {
        coder: {
            id: 'coder',
            name: '💻 代码狂人',
            desc: '代码能力极强，但思维稍弱',
            stats: {
                codeBonus: 1.3,
                thinkingBonus: 0.85,
                money: 400,
                morale: 70,
                hp: 100,
            }
        },
        thinker: {
            id: 'thinker',
            name: '🧠 思维大师',
            desc: '思维敏锐，代码稍弱',
            stats: {
                codeBonus: 0.85,
                thinkingBonus: 1.3,
                money: 500,
                morale: 85,
                hp: 90,
            }
        },
        balanced: {
            id: 'balanced',
            name: '⚖️ 均衡选手',
            desc: '各方面均衡发展',
            stats: {
                codeBonus: 1.0,
                thinkingBonus: 1.0,
                money: 600,
                morale: 80,
                hp: 100,
            }
        },
        lucky: {
            id: 'lucky',
            name: '🍀 幸运儿',
            desc: '运气好，但基础稍弱',
            stats: {
                codeBonus: 0.9,
                thinkingBonus: 0.9,
                money: 300,
                morale: 90,
                hp: 95,
                luckyBonus: 2,
            }
        }
    };

    // ============================================================
    //  3. 难度配置
    // ============================================================
    const DIFFICULTIES = {
        easy: {
            id: 'easy',
            label: '🌱 简单',
            maxTurn: 60,
            initialMoney: 600,
            hpDecay: 0.7,
            costMod: 0.7,
            expMod: 1.3,
        },
        normal: {
            id: 'normal',
            label: '⚡ 普通',
            maxTurn: 55,
            initialMoney: 500,
            hpDecay: 1.0,
            costMod: 1.0,
            expMod: 1.0,
        },
        hard: {
            id: 'hard',
            label: '🔥 困难',
            maxTurn: 45,
            initialMoney: 350,
            hpDecay: 1.4,
            costMod: 1.3,
            expMod: 0.8,
        }
    };

    // ============================================================
    //  4. 知识等级系统
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
    //  5. 知识领域配置
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
    //  6. 赛季配置
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
    //  7. 天赋系统
    // ============================================================
    const TALENTS = [
        { id: 'genius', name: '天才', desc: '知识获取 +30%', type: 'good' },
        { id: 'diligent', name: '勤奋', desc: '训练消耗 -20%', type: 'good' },
        { id: 'lucky', name: '幸运', desc: '比赛奖牌 +1', type: 'good' },
        { id: 'focused', name: '专注', desc: '研究效率 +25%', type: 'good' },
        { id: 'steady', name: '稳扎稳打', desc: '训练额外 +10% 经验', type: 'good' },
        { id: 'stress', name: '焦虑', desc: '精力消耗 +20%', type: 'bad' },
        { id: 'distracted', name: '分心', desc: '知识获取 -20%', type: 'bad' },
        { id: 'lazy', name: '懒惰', desc: '行动费用 +30%', type: 'bad' },
        { id: 'impatient', name: '急躁', desc: '比赛成功率 -15%', type: 'bad' },
    ];

    function applyTalentEffects(s) {
        s.talentBonus = 1.0;
        s.trainCostMod = 1.0;
        s.luckyBonus = 0;
        s.stressMod = 1.0;
        s.distractedMod = 1.0;
        s.lazyMod = 1.0;
        s.focusMod = 1.0;
        s.impatientMod = 1.0;
        s.steadyBonus = 1.0;

        for (const t of s.talents) {
            switch (t.id) {
                case 'genius': s.talentBonus = 1.3; break;
                case 'diligent': s.trainCostMod = 0.8; break;
                case 'lucky': s.luckyBonus = 1; break;
                case 'focused': s.focusMod = 1.25; break;
                case 'steady': s.steadyBonus = 1.1; break;
                case 'stress': s.stressMod = 1.2; break;
                case 'distracted': s.distractedMod = 0.8; break;
                case 'lazy': s.lazyMod = 1.3; break;
                case 'impatient': s.impatientMod = 0.85; break;
            }
        }
    }

    // ============================================================
    //  8. 游戏状态
    // ============================================================
    let state = {};
    let selectedDifficulty = 'normal';
    let selectedCharacter = 'balanced';

    function initState() {
        const charData = CHARACTERS[selectedCharacter];
        const diffData = DIFFICULTIES[selectedDifficulty];

        state = {
            hp: charData.stats.hp || 100,
            morale: charData.stats.morale || 80,
            medal: 0,
            money: diffData.initialMoney || charData.stats.money || 500,
            year: 0,
            turn: 1,
            gameOver: false,
            maxTurn: diffData.maxTurn || 55,
            yearLabels: ['高一', '高二', '高三'],
            knowledge: KNOWLEDGE_DOMAINS.map(d => ({ id: d.id, name: d.name, exp: 0 })),
            talents: [],
            talentBonus: 1.0,
            trainCostMod: 1.0,
            luckyBonus: charData.stats.luckyBonus || 0,
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
            easterEggs: [],
            diffId: selectedDifficulty,
            charId: selectedCharacter,
            hpDecay: diffData.hpDecay || 1.0,
            costMod: diffData.costMod || 1.0,
            expMod: diffData.expMod || 1.0,
            codeBonus: charData.stats.codeBonus || 1.0,
            thinkingBonus: charData.stats.thinkingBonus || 1.0,
        };
        for (const k of state.knowledge) {
            if (k.id === 'code') k.bonus = state.codeBonus;
            else if (k.id === 'thinking') k.bonus = state.thinkingBonus;
            else k.bonus = 1.0;
        }
    }

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
        state.talents.push({ ...talent });
        applyTalentEffects(state);
        return true;
    }

    function removeTalent(id) {
        const idx = state.talents.findIndex(t => t.id === id);
        if (idx === -1) return false;
        state.talents.splice(idx, 1);
        applyTalentEffects(state);
        return true;
    }

    // ============================================================
    //  9. 彩蛋系统
    // ============================================================
    const EASTER_EGGS = [
        { id: 'egg1', msg: '🥚 你发现了一本上古神书《算法导论》，知识 +10！', trigger: () => Math.random() < 0.03, effect: (s) => { s.knowledge.forEach(k => k.exp += 10); } },
        { id: 'egg2', msg: '🥚 你在机房发现了一张藏宝图，金钱 +100！', trigger: () => Math.random() < 0.025, effect: (s) => { s.money += 100; } },
        { id: 'egg3', msg: '🥚 一位神秘前辈出现，传授你"大力出奇迹"心法，士气 +20！', trigger: () => Math.random() < 0.02, effect: (s) => { s.morale = clamp(s.morale + 20, 0, 100); } },
        { id: 'egg4', msg: '🥚 你无意间发现了一个系统漏洞，获得 3 枚奖牌！', trigger: () => Math.random() < 0.015, effect: (s) => { s.medal += 3; } },
        { id: 'egg5', msg: '🥚 你遇到了传说中的"OI 之神"，所有知识 +5！', trigger: () => Math.random() < 0.01, effect: (s) => { s.knowledge.forEach(k => k.exp += 5); } },
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
    const modalContainer = document.getElementById('modalContainer');

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
    let gameStarted = false;

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

        const btns = [trainBtn, contestBtn, restBtn, researchBtn, socialBtn, specialBtn, awakenBtn];
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
        while (logArea.children.length > 35) {
            logArea.removeChild(logArea.firstChild);
        }
        logArea.scrollTop = logArea.scrollHeight;
    }

    // ============================================================
    //  12. 模态框系统（支持多选）
    // ============================================================
    function showModal(title, subtitle, options, onSubmit, onCancel, multiSelect = false) {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.id = 'activeModal';

        let optionsHTML = '';
        for (const opt of options) {
            const checked = opt.default ? 'selected' : '';
            const badge = opt.badge ? `<span class="badge ${opt.badge}">${opt.badgeText || ''}</span>` : '';
            optionsHTML += `
                <div class="modal-option ${checked}" data-value="${opt.value}" data-cost="${opt.cost || 0}">
                    <span>${opt.label} ${badge}</span>
                    <span class="desc">${opt.desc || ''}</span>
                    ${opt.cost !== undefined ? `<span class="cost">💰 ${opt.cost}</span>` : ''}
                    <span class="check">${multiSelect ? '☑️' : '✅'}</span>
                </div>
            `;
        }

        const multiHint = multiSelect ? '<span style="font-size:12px;opacity:0.6;">💡 点击选择多个天赋，再次点击取消选择</span>' : '';

        overlay.innerHTML = `
            <div class="modal-content">
                <button class="modal-close" id="modalClose">✕</button>
                <div class="modal-title">${title}</div>
                <div class="modal-subtitle">${subtitle} ${multiHint}</div>
                <div class="modal-options" id="modalOptions">
                    ${optionsHTML}
                </div>
                <div class="modal-actions">
                    <button class="modal-cancel" id="modalCancel">取消</button>
                    <button class="modal-submit" id="modalSubmit">确认</button>
                </div>
            </div>
        `;

        modalContainer.appendChild(overlay);

        const optionEls = overlay.querySelectorAll('.modal-option');
        if (multiSelect) {
            optionEls.forEach(el => {
                el.addEventListener('click', function() {
                    this.classList.toggle('selected');
                });
            });
        } else {
            optionEls.forEach(el => {
                el.addEventListener('click', function() {
                    optionEls.forEach(o => o.classList.remove('selected'));
                    this.classList.add('selected');
                });
            });
        }

        function closeModal() {
            if (overlay.parentNode) overlay.remove();
        }

        overlay.querySelector('#modalClose').addEventListener('click', closeModal);
        overlay.querySelector('#modalCancel').addEventListener('click', function() {
            closeModal();
            if (onCancel) onCancel();
        });

        overlay.querySelector('#modalSubmit').addEventListener('click', function() {
            const selected = overlay.querySelectorAll('.modal-option.selected');
            if (selected.length === 0) {
                addLog('⚠️ 请至少选择一个选项', 'danger');
                return;
            }
            const results = [];
            let totalCost = 0;
            selected.forEach(el => {
                const value = el.dataset.value;
                const cost = parseInt(el.dataset.cost) || 0;
                results.push({ value, cost });
                totalCost += cost;
            });
            closeModal();
            if (onSubmit) onSubmit(results, totalCost);
        });

        overlay.addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal();
                if (onCancel) onCancel();
            }
        });
    }

    // ============================================================
    //  13. 比赛过程模拟
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
    //  14. 年级晋升
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
    //  15. 评分系统
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
        const charName = CHARACTERS[state.charId]?.name || '选手';
        const diffLabel = DIFFICULTIES[state.diffId]?.label || '';
        gameOverMsg.innerHTML = `
            <div class="ending-title">${ending.title}</div>
            <div style="margin-top:4px;font-size:14px;opacity:0.8;">👤 ${charName} · ${diffLabel}</div>
            <div style="margin-top:6px;">${ending.desc}</div>
            <div style="margin-top:8px;font-size:18px;font-weight:600;">
                ${emoji} 评分：${grade} (${label}) — ${ending.score} 分
            </div>
            <div style="margin-top:4px;font-size:14px;">
                🏅 ${state.medal} 奖牌 · 💰 ${state.money} 金钱 · 💪 ${state.morale} 士气 · 📊 ${getAvgLevel().label}
            </div>
            <div style="margin-top:2px;font-size:13px;opacity:0.8;">
                训练${state.totalTrain} · 比赛${state.totalContest} · 科研${state.totalResearch} · 社交${state.totalSocial} · 休息${state.totalRest} · 觉醒${state.totalAwaken}
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
    //  16. 核心行动
    // ============================================================
    function getCost(base) {
        let cost = base * state.lazyMod * state.costMod;
        return Math.round(cost);
    }

    function getExpMod() {
        return state.expMod;
    }

    function actionTrain() {
        if (state.gameOver || state.contestInProgress || !gameStarted) return;
        
        const options = state.knowledge.map(k => ({
            value: k.id,
            label: k.name,
            desc: `当前: ${getLevel(k.exp).label}`,
            cost: 30
        }));

        showModal(
            '📖 选择训练题目',
            '选择要重点提升的知识领域 (每次训练消耗 $30)',
            options,
            function(results, totalCost) {
                const result = results[0];
                const cost = result.cost;
                if (state.money < cost) { addLog('❌ 金钱不足！', 'danger'); return; }
                if (state.hp < 10) { addLog('❌ 精力不足！', 'danger'); return; }

                state.money -= cost;
                state.hp = clamp(state.hp - 6 * state.stressMod * state.hpDecay, 0, 100);
                state.morale = clamp(state.morale - 2, 0, 100);
                state.totalTrain++;

                const target = state.knowledge.find(k => k.id === result.value);
                const bonus = target.bonus || 1.0;
                const baseGain = Math.floor(Math.random() * 8 + 5);
                const gain = Math.floor(baseGain * state.talentBonus * state.steadyBonus * bonus * getExpMod() * (1 - (state.distractedMod - 1) * 0.5));
                target.exp += gain;

                const lv = getLevel(target.exp);
                addLog(`📖 训练 ${target.name} +${gain} 经验 → ${lv.label} (💰-${cost})`, 'knowledge-up');

                if (Math.random() < 0.05) {
                    const talent = TALENTS[Math.floor(Math.random() * TALENTS.length)];
                    if (talent.type === 'good' && !hasTalent(talent.id)) {
                        if (addTalent(talent.id)) {
                            addLog(`✨ 训练中觉醒天赋：${talent.name}！`, 'talent');
                        }
                    }
                }
                advanceTurn();
            }
        );
    }

    function actionResearch() {
        if (state.gameOver || state.contestInProgress || !gameStarted) return;

        const options = [
            { value: 'light', label: '🌱 轻度研究', desc: '消耗少，收益低', cost: 40 },
            { value: 'medium', label: '🌿 中度研究', desc: '均衡选择', cost: 80 },
            { value: 'heavy', label: '🌳 重度研究', desc: '消耗大，收益高', cost: 140 },
        ];

        showModal(
            '🔬 选择研究强度',
            '研究消耗精力与金钱，全面提升各知识点',
            options,
            function(results, totalCost) {
                const result = results[0];
                const cost = result.cost;
                if (state.money < cost) { addLog('❌ 金钱不足！', 'danger'); return; }
                if (state.hp < 15) { addLog('❌ 精力不足！', 'danger'); return; }

                state.money -= cost;
                const hpCost = result.value === 'light' ? 8 : result.value === 'medium' ? 14 : 22;
                state.hp = clamp(state.hp - hpCost * state.stressMod * state.hpDecay, 0, 100);
                state.morale = clamp(state.morale - (result.value === 'light' ? 2 : result.value === 'medium' ? 4 : 6), 0, 100);
                state.totalResearch++;

                const baseGain = result.value === 'light' ? Math.floor(Math.random() * 10 + 8) : 
                                 result.value === 'medium' ? Math.floor(Math.random() * 18 + 14) : 
                                 Math.floor(Math.random() * 28 + 20);
                const gain = Math.floor(baseGain * state.talentBonus * state.focusMod * getExpMod() * (1 - (state.distractedMod - 1) * 0.3));
                
                for (const k of state.knowledge) {
                    const bonus = k.bonus || 1.0;
                    k.exp += Math.floor(gain / state.knowledge.length * bonus);
                }
                const extra = Math.floor(Math.random() * 5) + 2;
                const d = state.knowledge[Math.floor(Math.random() * state.knowledge.length)];
                d.exp += extra;

                const label = result.value === 'light' ? '轻度' : result.value === 'medium' ? '中度' : '重度';
                addLog(`🔬 ${label}研究 +${gain} 总经验，${d.name} +${extra} (💰-${cost})`, 'knowledge-up');

                if (Math.random() < (result.value === 'light' ? 0.05 : result.value === 'medium' ? 0.10 : 0.18)) {
                    const talent = TALENTS[Math.floor(Math.random() * TALENTS.length)];
                    if (talent.type === 'good' && !hasTalent(talent.id)) {
                        if (addTalent(talent.id)) {
                            addLog(`✨ 研究中觉醒天赋：${talent.name}！`, 'talent');
                        }
                    }
                }
                advanceTurn();
            }
        );
    }

    function actionAwaken() {
        if (state.gameOver || state.contestInProgress || !gameStarted) return;
        if (state.hp < 20) { addLog('❌ 精力不足 (需要 ≥20)！', 'danger'); return; }

        const available = TALENTS.filter(t => !hasTalent(t.id));
        if (available.length === 0) {
            addLog('✨ 你已拥有所有天赋！', 'highlight');
            return;
        }

        const options = available.map(t => ({
            value: t.id,
            label: t.name,
            desc: t.desc,
            cost: 100,
            badge: t.type === 'good' ? 'good' : 'bad',
            badgeText: t.type === 'good' ? '✅ 好' : '⚠️ 坏'
        }));

        showModal(
            '✨ 选择要觉醒的天赋',
            '每个天赋 $100，成功率 40%，可多选',
            options,
            function(results, totalCost) {
                if (state.money < totalCost) { addLog(`❌ 金钱不足！需要 $${totalCost}`, 'danger'); return; }
                if (state.hp < 20) { addLog('❌ 精力不足！', 'danger'); return; }

                state.money -= totalCost;
                state.hp = clamp(state.hp - 8 * results.length, 0, 100);
                state.totalAwaken += results.length;

                let successCount = 0;
                for (const r of results) {
                    const success = Math.random() < 0.40;
                    if (success) {
                        const talent = TALENTS.find(t => t.id === r.value);
                        if (addTalent(talent.id)) {
                            successCount++;
                            addLog(`✨ 觉醒成功！获得天赋：${talent.name}`, 'talent');
                        }
                    }
                }
                if (successCount === 0) {
                    addLog('💔 所有天赋觉醒失败... 继续努力！', 'danger');
                } else {
                    addLog(`🎉 成功觉醒 ${successCount} 个天赋！`, 'success');
                }
                advanceTurn();
            },
            null,
            true
        );
    }

    function actionContest() {
        if (state.gameOver || state.contestInProgress || !gameStarted) return;
        const cost = getCost(50);
        if (state.money < cost) { addLog('❌ 金钱不足！', 'danger'); return; }

        state.money -= cost;
        simulateContest('常规赛', () => {
            state.hp = clamp(state.hp - 10 * state.stressMod * state.hpDecay, 0, 100);
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
            state.hp = clamp(state.hp - 14 * state.stressMod * state.hpDecay, 0, 100);
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
                const bonus2 = k.bonus || 1.0;
                k.exp += Math.floor(knowledgeBoost / state.knowledge.length * bonus2);
            }

            addLog(`🏆 ${event.name} 完成！获得 ${medalGain} 奖牌，金钱 +${medalGain*30}`, 'contest');
            addLog(`📌 ${event.desc}`, 'highlight');
            advanceTurn();
        });
    }

    // ============================================================
    //  17. 回合推进
    // ============================================================
    function advanceTurn() {
        if (state.gameOver) return;

        state.turn++;

        if (state.hp > 0) {
            const decay = Math.floor(Math.random() * 3) + 1;
            state.hp = clamp(state.hp - decay * state.hpDecay, 0, 100);
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
    //  18. 特殊事件
    // ============================================================
    const SPECIAL_EVENTS = [
        { type: 'good', weight: 20, msg: '📚 发现珍贵资料，随机知识 +5', effect: (s) => { const d = s.knowledge[Math.floor(Math.random() * s.knowledge.length)]; d.exp += 5 * s.expMod; } },
        { type: 'good', weight: 15, msg: '💪 体能训练，精力 +12', effect: (s) => { s.hp = clamp(s.hp + 12, 0, 100); } },
        { type: 'good', weight: 15, msg: '🎯 学长分享经验，士气 +10', effect: (s) => { s.morale = clamp(s.morale + 10, 0, 100); } },
        { type: 'good', weight: 10, msg: '🌟 天赋觉醒！获得随机天赋', effect: (s) => { 
            const talent = TALENTS[Math.floor(Math.random() * TALENTS.length)];
            if (talent.type === 'good' && !hasTalent(talent.id)) {
                if (addTalent(talent.id)) {
                    addLog(`✨ 觉醒天赋：${talent.name} — ${talent.desc}`, 'talent');
                }
            }
        }},
        { type: 'good', weight: 8, msg: '💎 捡到钱袋，金钱 +80', effect: (s) => { s.money += 80; } },
        { type: 'bad', weight: 20, msg: '😷 感冒了，精力 -8', effect: (s) => { s.hp = clamp(s.hp - 8 * s.hpDecay, 0, 100); } },
        { type: 'bad', weight: 15, msg: '😤 被老师批评，士气 -10', effect: (s) => { s.morale = clamp(s.morale - 10, 0, 100); } },
        { type: 'bad', weight: 12, msg: '📉 遇到难题，随机知识 -3', effect: (s) => { const d = s.knowledge[Math.floor(Math.random() * s.knowledge.length)]; d.exp = Math.max(0, d.exp - 3); } },
        { type: 'bad', weight: 10, msg: '💤 睡眠不足，精力 -5，士气 -5', effect: (s) => { s.hp = clamp(s.hp - 5 * s.hpDecay, 0, 100); s.morale = clamp(s.morale - 5, 0, 100); } },
        { type: 'bad', weight: 8, msg: '🌀 天赋消除！失去一个随机天赋', effect: (s) => {
            const goodTalents = s.talents.filter(t => t.type === 'good');
            if (goodTalents.length > 0) {
                const t = goodTalents[Math.floor(Math.random() * goodTalents.length)];
                removeTalent(t.id);
                addLog(`💔 失去天赋：${t.name}`, 'danger');
            }
        }},
        { type: 'mixed', weight: 12, msg: '⚖️ 精力 -3，随机知识 +4', effect: (s) => { s.hp = clamp(s.hp - 3 * s.hpDecay, 0, 100); const d = s.knowledge[Math.floor(Math.random() * s.knowledge.length)]; d.exp += 4 * s.expMod; } },
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
    //  19. 菜单交互
    // ============================================================
    function setupMenu() {
        // 难度选择
        const diffOptions = document.querySelectorAll('#difficultyOptions .menu-option');
        diffOptions.forEach(el => {
            el.addEventListener('click', function(e) {
                e.stopPropagation();
                diffOptions.forEach(o => o.classList.remove('selected'));
                this.classList.add('selected');
                selectedDifficulty = this.dataset.value;
                updateCharacterDetail();
            });
        });

        // 人物选择
        const charOptions = document.querySelectorAll('#characterOptions .menu-option');
        charOptions.forEach(el => {
            el.addEventListener('click', function(e) {
                e.stopPropagation();
                charOptions.forEach(o => o.classList.remove('selected'));
                this.classList.add('selected');
                selectedCharacter = this.dataset.value;
                updateCharacterDetail();
            });
        });

        updateCharacterDetail();
    }

    function updateCharacterDetail() {
        const char = CHARACTERS[selectedCharacter];
        const detailEl = document.getElementById('characterDetail');
        if (char) {
            const diff = DIFFICULTIES[selectedDifficulty];
            const stats = char.stats;
            detailEl.innerHTML = `
                <div class="detail-name">${char.name}</div>
                <div class="detail-desc">${char.desc}</div>
                <div class="detail-stats">
                    <span>📚 代码: ${stats.codeBonus >= 1 ? '+' : ''}${Math.round((stats.codeBonus - 1) * 100)}%</span>
                    <span>🧠 思维: ${stats.thinkingBonus >= 1 ? '+' : ''}${Math.round((stats.thinkingBonus - 1) * 100)}%</span>
                    <span>💰 初始金钱: ${stats.money}</span>
                    ${stats.luckyBonus ? `<span>🍀 幸运: +${stats.luckyBonus}</span>` : ''}
                    <span>💪 士气: ${stats.morale}</span>
                </div>
                <div style="font-size:12px;opacity:0.6;margin-top:4px;">
                    🎯 难度: ${diff ? diff.label : '普通'} · 回合: ${diff ? diff.maxTurn : 55}
                </div>
            `;
        }
    }

    // ============================================================
    //  20. 重置游戏
    // ============================================================
    function resetGame() {
        initState();

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
    //  21. 菜单控制
    // ============================================================
    const menuOverlay = document.getElementById('menuOverlay');
    const startGameBtn = document.getElementById('startGameBtn');

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
    //  22. 初始化
    // ============================================================
    function init() {
        setupMenu();

        trainBtn.addEventListener('click', actionTrain);
        contestBtn.addEventListener('click', actionContest);
        restBtn.addEventListener('click', actionRest);
        researchBtn.addEventListener('click', actionResearch);
        socialBtn.addEventListener('click', actionSocial);
        specialBtn.addEventListener('click', actionSpecial);
        awakenBtn.addEventListener('click', actionAwaken);
        resetBtn.addEventListener('click', resetGame);

        startGameBtn.addEventListener('click', function() {
            initState();
            hideMenu();
            gameStarted = true;
            state.gameOver = false;

            const charName = CHARACTERS[selectedCharacter]?.name || '选手';
            const diffLabel = DIFFICULTIES[selectedDifficulty]?.label || '普通';
            logArea.innerHTML = '';
            addLog(`🧑‍💻 ${charName} · ${diffLabel} 模式开始！`, 'highlight');
            addLog(`⏱️ ${state.maxTurn} 回合 (约 ${Math.round(state.maxTurn * 0.2)} 分钟)`);
            addLog('📖 训练可选择题目针对性提升');
            addLog('🔬 科研分轻/中/重度，消耗不同');
            addLog('✨ 觉醒可多选天赋，每个 $100，成功率 40%');

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