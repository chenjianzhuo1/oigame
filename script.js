// script.js - 竞速线完整版（含地狱难度 & 失败堆叠）
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
    //  2. 省份配置
    // ============================================================
    const PROVINCES = {
        zhejiang: {
            id: 'zhejiang',
            name: '🌊 浙江',
            desc: '竞赛强省，资源丰富但竞争激烈',
            stats: {
                moneyBonus: 1.3,
                contestDifficulty: 1.2,
                cultureBonus: 1.1,
            }
        },
        guangdong: {
            id: 'guangdong',
            name: '🏖️ 广东',
            desc: '沿海省份，台风影响训练',
            stats: {
                moneyBonus: 1.2,
                contestDifficulty: 1.1,
                cultureBonus: 1.0,
                typhoon: true,
            }
        },
        beijing: {
            id: 'beijing',
            name: '🏛️ 北京',
            desc: '首都资源，名校云集',
            stats: {
                moneyBonus: 1.4,
                contestDifficulty: 1.3,
                cultureBonus: 1.2,
            }
        },
        sichuan: {
            id: 'sichuan',
            name: '🏔️ 四川',
            desc: '山地省份，训练环境艰苦',
            stats: {
                moneyBonus: 0.9,
                contestDifficulty: 0.9,
                cultureBonus: 0.9,
            }
        },
        shanghai: {
            id: 'shanghai',
            name: '🌆 上海',
            desc: '国际化都市，竞赛资源丰富',
            stats: {
                moneyBonus: 1.3,
                contestDifficulty: 1.15,
                cultureBonus: 1.15,
            }
        }
    };

    // ============================================================
    //  3. 人物配置
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
    //  4. 难度配置（含地狱难度）
    // ============================================================
    const DIFFICULTIES = {
        easy: {
            id: 'easy',
            label: '🌱 简单',
            maxTurn: 65,
            initialMoney: 600,
            hpDecay: 0.6,
            costMod: 0.7,
            expMod: 1.3,
            contestReqMod: 0.7,
            failStackBonus: 0.5,
            hellMode: false,
        },
        normal: {
            id: 'normal',
            label: '⚡ 普通',
            maxTurn: 55,
            initialMoney: 500,
            hpDecay: 1.0,
            costMod: 1.0,
            expMod: 1.0,
            contestReqMod: 1.0,
            failStackBonus: 0.3,
            hellMode: false,
        },
        hard: {
            id: 'hard',
            label: '🔥 困难',
            maxTurn: 45,
            initialMoney: 350,
            hpDecay: 1.3,
            costMod: 1.2,
            expMod: 0.85,
            contestReqMod: 1.2,
            failStackBonus: 0.2,
            hellMode: false,
        },
        hell: {
            id: 'hell',
            label: '💀 地狱',
            maxTurn: 40,
            initialMoney: 200,
            hpDecay: 1.8,
            costMod: 1.5,
            expMod: 0.7,
            contestReqMod: 1.5,
            failStackBonus: 0.15,
            hellMode: true,
            hellDesc: '⚰️ 极难模式 · 失败惩罚加倍 · 通关奖励翻倍',
        }
    };

    // ============================================================
    //  5. 竞速赛程配置
    // ============================================================
    const RACE_STAGES = [
        { id: 'csp', name: 'CSP', next: 'noip', medalReq: 1, desc: 'CSP 认证', reqBase: 15 },
        { id: 'noip', name: 'NOIP', next: 'provincial', medalReq: 1, desc: '全国青少年信息学奥林匹克联赛', reqBase: 35 },
        { id: 'provincial', name: '省选', next: 'noi', medalReq: 1, desc: '省级选拔', reqBase: 55 },
        { id: 'noi', name: 'NOI', next: 'national_team', medalReq: 1, desc: '全国青少年信息学奥林匹克竞赛', reqBase: 80 },
        { id: 'national_team', name: '国家队', next: null, medalReq: 1, desc: '中国国家队', reqBase: 120 },
    ];

    // ============================================================
    //  6. 知识等级系统
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
    //  7. 知识领域配置（含文化课）
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
        { id: 'culture', name: '文化课' },
    ];

    // ============================================================
    //  8. 天赋系统
    // ============================================================
    const TALENTS = [
        { id: 'genius', name: '天才', desc: '知识获取 +30%', type: 'good' },
        { id: 'diligent', name: '勤奋', desc: '训练消耗 -20%', type: 'good' },
        { id: 'lucky', name: '幸运', desc: '比赛奖牌 +1', type: 'good' },
        { id: 'focused', name: '专注', desc: '研究效率 +25%', type: 'good' },
        { id: 'steady', name: '稳扎稳打', desc: '训练额外 +10% 经验', type: 'good' },
        { id: 'culture_pro', name: '文化课专精', desc: '文化课 +30%', type: 'good' },
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
        s.cultureBonus = 1.0;

        for (const t of s.talents) {
            switch (t.id) {
                case 'genius': s.talentBonus = 1.3; break;
                case 'diligent': s.trainCostMod = 0.8; break;
                case 'lucky': s.luckyBonus = 1; break;
                case 'focused': s.focusMod = 1.25; break;
                case 'steady': s.steadyBonus = 1.1; break;
                case 'culture_pro': s.cultureBonus = 1.3; break;
                case 'stress': s.stressMod = 1.2; break;
                case 'distracted': s.distractedMod = 0.8; break;
                case 'lazy': s.lazyMod = 1.3; break;
                case 'impatient': s.impatientMod = 0.85; break;
            }
        }
    }

    // ============================================================
    //  9. 游戏状态
    // ============================================================
    let state = {};
    let selectedDifficulty = 'normal';
    let selectedCharacter = 'balanced';
    let selectedProvince = 'zhejiang';

    function initState() {
        const charData = CHARACTERS[selectedCharacter];
        const diffData = DIFFICULTIES[selectedDifficulty];
        const provData = PROVINCES[selectedProvince];

        state = {
            hp: charData.stats.hp || 100,
            morale: charData.stats.morale || 80,
            medal: 0,
            money: Math.round((diffData.initialMoney || charData.stats.money || 500) * (provData.stats.moneyBonus || 1.0)),
            year: 0,
            turn: 1,
            gameOver: false,
            gameOverReason: '',
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
            cultureBonus: 1.0,
            totalTrain: 0,
            totalContest: 0,
            totalRest: 0,
            totalResearch: 0,
            totalSocial: 0,
            totalAwaken: 0,
            totalStudy: 0,
            endingTriggered: false,
            triggeredEvents: new Set(),
            contestInProgress: false,
            contestProgress: 0,
            easterEggs: [],
            diffId: selectedDifficulty,
            charId: selectedCharacter,
            provId: selectedProvince,
            hpDecay: diffData.hpDecay || 1.0,
            costMod: diffData.costMod || 1.0,
            expMod: diffData.expMod || 1.0,
            contestReqMod: diffData.contestReqMod || 1.0,
            failStackBonus: diffData.failStackBonus || 0.3,
            hellMode: diffData.hellMode || false,
            codeBonus: charData.stats.codeBonus || 1.0,
            thinkingBonus: charData.stats.thinkingBonus || 1.0,
            provMoneyBonus: provData.stats.moneyBonus || 1.0,
            provContestDifficulty: provData.stats.contestDifficulty || 1.0,
            provCultureBonus: provData.stats.cultureBonus || 1.0,
            provTyphoon: provData.stats.typhoon || false,
            // 竞速相关
            currentStage: 0,
            stageAttempts: 0,
            stagePassed: false,
            raceEnded: false,
            cultureEscape: false,
            // 失败堆叠
            failStack: 0,
            failBonus: 0,
        };
        for (const k of state.knowledge) {
            if (k.id === 'code') k.bonus = state.codeBonus;
            else if (k.id === 'thinking') k.bonus = state.thinkingBonus;
            else if (k.id === 'culture') k.bonus = state.cultureBonus * state.provCultureBonus;
            else k.bonus = 1.0;
        }
    }

    function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

    function getAvgLevel() {
        let total = 0;
        let count = 0;
        for (const k of state.knowledge) {
            if (k.id === 'culture') continue;
            total += getLevel(k.exp).value;
            count++;
        }
        const avg = Math.round(total / count);
        const lv = LEVELS.find(l => l.value === Math.min(avg, LEVELS.length - 1));
        return lv || LEVELS[0];
    }

    function getTotalExp() {
        let total = 0;
        for (const k of state.knowledge) {
            if (k.id === 'culture') continue;
            total += k.exp;
        }
        return total;
    }

    function getCultureLevel() {
        const culture = state.knowledge.find(k => k.id === 'culture');
        return getLevel(culture ? culture.exp : 0);
    }

    function getCurrentStage() {
        return RACE_STAGES[state.currentStage] || RACE_STAGES[0];
    }

    function getStageName() {
        return getCurrentStage().name;
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
    //  10. 彩蛋系统
    // ============================================================
    const EASTER_EGGS = [
        { id: 'egg1', msg: '🥚 你发现了一本上古神书《算法导论》，知识 +10！', trigger: () => Math.random() < 0.03, effect: (s) => { s.knowledge.forEach(k => { if (k.id !== 'culture') k.exp += 10; }); } },
        { id: 'egg2', msg: '🥚 你在机房发现了一张藏宝图，金钱 +100！', trigger: () => Math.random() < 0.025, effect: (s) => { s.money += 100; } },
        { id: 'egg3', msg: '🥚 一位神秘前辈出现，传授你"大力出奇迹"心法，士气 +20！', trigger: () => Math.random() < 0.02, effect: (s) => { s.morale = clamp(s.morale + 20, 0, 100); } },
        { id: 'egg4', msg: '🥚 你无意间发现了一个系统漏洞，获得 3 枚奖牌！', trigger: () => Math.random() < 0.015, effect: (s) => { s.medal += 3; } },
        { id: 'egg5', msg: '🥚 你遇到了传说中的"OI 之神"，所有知识 +5！', trigger: () => Math.random() < 0.01, effect: (s) => { s.knowledge.forEach(k => { if (k.id !== 'culture') k.exp += 5; }); } },
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
    //  11. DOM 缓存
    // ============================================================
    const hpDisplay = document.getElementById('hpDisplay');
    const moneyDisplay = document.getElementById('moneyDisplay');
    const medalDisplay = document.getElementById('medalDisplay');
    const moraleDisplay = document.getElementById('moraleDisplay');
    const avgLevelDisplay = document.getElementById('avgLevelDisplay');
    const yearDisplay = document.getElementById('yearDisplay');
    const seasonDisplay = document.getElementById('seasonDisplay');
    const stageDisplay = document.getElementById('stageDisplay');
    const failStackDisplay = document.getElementById('failStackDisplay');
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
    const studyBtn = document.getElementById('studyBtn');
    const awakenBtn = document.getElementById('awakenBtn');
    const resetBtn = document.getElementById('resetBtn');

    // ============================================================
    //  12. UI 更新
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
        stageDisplay.textContent = getStageName();
        failStackDisplay.textContent = state.failStack;

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
            const isCulture = k.id === 'culture';
            const div = document.createElement('div');
            div.className = 'knowledge-item';
            div.innerHTML = `
                <span class="kname">${k.name}${isCulture ? ' 📝' : ''}</span>
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

        const btns = [trainBtn, contestBtn, restBtn, researchBtn, socialBtn, studyBtn, awakenBtn];
        btns.forEach(btn => btn.disabled = state.gameOver || state.contestInProgress || !gameStarted);

        if (!state.gameOver && !state.contestInProgress && gameStarted) {
            const stage = getCurrentStage();
            if (stage.next === null && state.raceEnded) {
                contestBtn.innerHTML = `🏆 已通关 <span class="sub">恭喜！</span>`;
            } else if (state.stagePassed) {
                contestBtn.innerHTML = `⚔️ 晋级下一阶段 <span class="sub">${stage.next ? RACE_STAGES.find(s => s.id === stage.next)?.name || '下一阶段' : '已通关'}</span>`;
            } else {
                const stackBonus = state.failStack > 0 ? ` (+${Math.round(state.failBonus * 100)}%)` : '';
                contestBtn.innerHTML = `⚔️ 比赛 <span class="sub">${stage.name} 晋级赛 ($50)${stackBonus}</span>`;
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
        while (logArea.children.length > 40) {
            logArea.removeChild(logArea.firstChild);
        }
        logArea.scrollTop = logArea.scrollHeight;
    }

    // ============================================================
    //  13. 赛季配置
    // ============================================================
    function getCurrentSeasonName(year) {
        const names = ['高一赛季', '高二赛季', '高三赛季'];
        return names[year] || '未知赛季';
    }

    // ============================================================
    //  14. 模态框系统
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

        const multiHint = multiSelect ? '<span style="font-size:12px;opacity:0.6;">💡 点击选择多个，再次点击取消选择</span>' : '';

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
    //  15. 比赛模拟
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
        }, 500);
    }

    // ============================================================
    //  16. 竞速晋级系统（含失败堆叠）
    // ============================================================
    function checkRaceAdvance() {
        if (state.raceEnded) return;
        const stage = getCurrentStage();
        if (stage.next === null) {
            state.raceEnded = true;
            addLog(`🏆 恭喜！你已进入国家队！`, 'stage');
            return;
        }

        const cultureLevel = getCultureLevel();
        if (cultureLevel.value >= 10) {
            state.cultureEscape = true;
            state.gameOver = true;
            state.gameOverReason = 'culture';
            addLog('📝 文化课达到 S 级，你选择了回归文化课道路！', 'ending');
            triggerEnding();
            return;
        }

        if (state.medal >= 1 && state.stagePassed) {
            const nextStage = RACE_STAGES.find(s => s.id === stage.next);
            if (nextStage) {
                state.currentStage = RACE_STAGES.indexOf(nextStage);
                state.stagePassed = false;
                state.medal = 0;
                // 地狱难度晋级额外奖励
                if (state.hellMode) {
                    const hellBonus = Math.floor(Math.random() * 10) + 10;
                    state.knowledge.forEach(k => {
                        if (k.id !== 'culture') k.exp += Math.floor(hellBonus / 2);
                    });
                    addLog(`💀 地狱难度晋级奖励：各知识 +${Math.floor(hellBonus/2)}`, 'hell');
                }
                addLog(`🎯 晋级成功！进入 ${nextStage.name} 阶段！`, 'stage');
                updateUI();
            }
        }
    }

    // ============================================================
    //  17. 年级晋升
    // ============================================================
    function checkYearUpgrade() {
        if (state.year >= 2) return;
        const threshold = (state.year + 1) * 18;
        if (state.turn > threshold) {
            state.year++;
            addLog(`🎓 升入 ${state.yearLabels[state.year]}！`, 'highlight');
            if (state.year === 2) {
                addLog('🏁 高三冲刺 · 最后一搏！', 'highlight');
            }
            if (state.stagePassed) {
                state.stagePassed = false;
                state.medal = 0;
            }
            updateUI();
        }
    }

    // ============================================================
    //  18. 评分系统
    // ============================================================
    function calculateScore() {
        const { medal, money, morale, totalTrain, totalContest, totalResearch, totalSocial, totalRest, totalAwaken, totalStudy } = state;
        let score = 0;
        score += medal * 15;
        score += Math.floor(money / 5);
        score += Math.floor(morale / 2);
        score += getTotalExp();
        const cultureLv = getCultureLevel();
        score += cultureLv.value * 20;
        const actions = [totalTrain, totalContest, totalResearch, totalSocial, totalRest, totalStudy];
        const nonZero = actions.filter(a => a > 0).length;
        score += nonZero * 10;
        score += totalAwaken * 5;
        if (state.turn >= state.maxTurn) score += 50;
        if (state.year === 2 && state.turn > 40) score += 30;
        score += state.talents.filter(t => t.type === 'good').length * 15;
        score -= state.talents.filter(t => t.type === 'bad').length * 10;
        score += state.easterEggs.length * 5;
        score += state.currentStage * 30;
        if (state.raceEnded) score += 100;
        // 地狱难度通关加成
        if (state.hellMode && state.raceEnded) score += 80;
        // 失败堆叠惩罚（负向激励）
        score -= state.failStack * 2;
        return Math.max(0, score);
    }

    function getScoreGrade(score) {
        if (score >= 600) return { grade: 'SSS', label: '传奇大师', emoji: '👑' };
        if (score >= 450) return { grade: 'SS', label: '顶尖高手', emoji: '🌟' };
        if (score >= 320) return { grade: 'S', label: '优秀选手', emoji: '⭐' };
        if (score >= 220) return { grade: 'A', label: '潜力新星', emoji: '💫' };
        if (score >= 140) return { grade: 'B', label: '稳步成长', emoji: '📈' };
        return { grade: 'C', label: 'OI 探索者', emoji: '🌱' };
    }

    function getEnding() {
        const { medal, morale } = state;
        const score = calculateScore();
        const grade = getScoreGrade(score);
        const totalExp = getTotalExp();
        const cultureLv = getCultureLevel();

        if (state.cultureEscape || cultureLv.value >= 10) {
            return { title: '📝 文化课之路', desc: '你选择了回归文化课，高考取得优异成绩！', color: '#7ec8e3', score, grade };
        }
        if (state.raceEnded) {
            if (state.hellMode) {
                return { title: '👑 地狱征服者', desc: '在最难模式下成功入选国家队，传奇！', color: '#ff4444', score, grade };
            }
            return { title: '🏆 国家队选手', desc: '成功入选中国国家队，为国争光！', color: '#ffd700', score, grade };
        }
        if (state.year >= 2 && state.currentStage < 3) {
            return { title: '💔 竞速断裂', desc: '未能通过省选，竞赛生涯遗憾结束', color: '#f78b8b', score, grade };
        }
        if (medal >= 20 && totalExp >= 300) return { title: '🥇 优秀竞赛选手', desc: '竞赛成绩优异，保送名校！', color: '#ffb347', score, grade };
        if (totalExp >= 350 && medal < 15) return { title: '🔬 计算机科学家', desc: '学术研究卓越，保送顶尖高校！', color: '#7ec8e3', score, grade };
        if (medal >= 15 && morale >= 85) return { title: '🏅 团队核心', desc: '带领团队屡创佳绩！', color: '#6fcf97', score, grade };
        if (morale >= 90 && totalExp >= 150) return { title: '💪 快乐OIer', desc: '享受编程，平衡生活！', color: '#f2c94a', score, grade };
        if (totalExp < 80 && medal < 5) return { title: '😅 佛系体验', desc: '重在参与，快乐OI！', color: '#a0a0a0', score, grade };
        return { title: '🌟 普通OIer', desc: '三年生涯，收获满满！', color: '#b3defa', score, grade };
    }

    function triggerEnding() {
        if (state.endingTriggered) return;
        state.endingTriggered = true;
        const ending = getEnding();
        const { grade, label, emoji } = ending.grade;
        const totalExp = getTotalExp();
        const cultureLv = getCultureLevel();
        const charName = CHARACTERS[state.charId]?.name || '选手';
        const provName = PROVINCES[state.provId]?.name || '';
        const diffLabel = DIFFICULTIES[state.diffId]?.label || '';

        let endingNote = '';
        if (state.cultureEscape || cultureLv.value >= 10) {
            endingNote = '📝 文化课结局 - 回归高考之路';
        } else if (state.raceEnded) {
            endingNote = state.hellMode ? '💀 地狱难度通关！' : '🏆 竞速结局 - 成功入选国家队！';
        } else if (state.year >= 2 && state.currentStage < 3) {
            endingNote = '💔 竞速断裂 - 未能通过省选';
        }

        gameOverMsg.innerHTML = `
            <div class="ending-title">${ending.title}</div>
            <div style="margin-top:4px;font-size:13px;opacity:0.8;">👤 ${charName} · ${provName} · ${diffLabel}</div>
            ${endingNote ? `<div style="margin-top:2px;font-size:12px;opacity:0.7;">${endingNote}</div>` : ''}
            <div style="margin-top:6px;">${ending.desc}</div>
            <div style="margin-top:8px;font-size:18px;font-weight:600;">
                ${emoji} 评分：${grade} (${label}) — ${ending.score} 分
            </div>
            <div style="margin-top:4px;font-size:13px;">
                🏅 ${state.medal} 奖牌 · 💰 ${state.money} 金钱 · 💪 ${state.morale} 士气 · 📊 ${getAvgLevel().label}
            </div>
            <div style="margin-top:2px;font-size:12px;opacity:0.8;">
                📝 文化课: ${cultureLv.label} · 🏆 赛段: ${getStageName()} · 📈 失败堆叠: ${state.failStack}
            </div>
            <div style="margin-top:2px;font-size:12px;opacity:0.8;">
                训练${state.totalTrain} · 比赛${state.totalContest} · 科研${state.totalResearch} · 社交${state.totalSocial} · 休息${state.totalRest} · 文化课${state.totalStudy} · 觉醒${state.totalAwaken}
            </div>
            <div style="margin-top:4px;font-size:11px;opacity:0.6;">
                总经验 ${totalExp} · 天赋 ${state.talents.length} 个
                ${state.easterEggs.length > 0 ? ` · 🥚 彩蛋 ${state.easterEggs.length} 个` : ''}
            </div>
        `;
        gameOverMsg.style.borderColor = ending.color;
        gameOverMsg.style.background = currentTheme === 'dark' ? '#1a2a2a' : '#f0e8d8';
        addLog(`🏁 结局达成: ${ending.title}`, 'ending');
        updateUI();
    }

    // ============================================================
    //  19. 核心行动
    // ============================================================
    function getCost(base) {
        let cost = base * state.lazyMod * state.costMod;
        return Math.round(cost);
    }

    function getExpMod() {
        return state.expMod;
    }

    // ----- 训练 -----
    function actionTrain() {
        if (state.gameOver || state.contestInProgress || !gameStarted) return;
        
        const options = state.knowledge.filter(k => k.id !== 'culture').map(k => ({
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
                if (state.provTyphoon && Math.random() < 0.03) {
                    const loss = Math.floor(Math.random() * 4) + 2;
                    state.hp = clamp(state.hp - loss, 0, 100);
                    addLog(`🌪️ 台风影响训练，精力 -${loss}`, 'danger');
                }
                advanceTurn();
            }
        );
    }

    // ----- 文化课 -----
    function actionStudy() {
        if (state.gameOver || state.contestInProgress || !gameStarted) return;
        const cost = getCost(20);
        if (state.money < cost) { addLog('❌ 金钱不足！', 'danger'); return; }
        if (state.hp < 8) { addLog('❌ 精力不足！', 'danger'); return; }

        state.money -= cost;
        state.hp = clamp(state.hp - 4 * state.stressMod * state.hpDecay, 0, 100);
        state.morale = clamp(state.morale - 1, 0, 100);
        state.totalStudy++;

        const target = state.knowledge.find(k => k.id === 'culture');
        const bonus = target.bonus || 1.0;
        const baseGain = Math.floor(Math.random() * 6 + 4);
        const gain = Math.floor(baseGain * state.cultureBonus * bonus * getExpMod());
        target.exp += gain;

        const lv = getLevel(target.exp);
        addLog(`📝 文化课学习 +${gain} 经验 → ${lv.label} (💰-${cost})`, 'knowledge-up');

        if (lv.value >= 10 && !state.gameOver) {
            addLog('📝 文化课达到 S 级！你面临选择...', 'highlight');
        }

        if (Math.random() < 0.03) {
            const talent = TALENTS.find(t => t.id === 'culture_pro');
            if (talent && !hasTalent('culture_pro')) {
                if (addTalent('culture_pro')) {
                    addLog(`✨ 文化课专精天赋觉醒！`, 'talent');
                }
            }
        }
        advanceTurn();
    }

    // ----- 科研 -----
    function actionResearch() {
        if (state.gameOver || state.contestInProgress || !gameStarted) return;

        const options = [
            { value: 'light', label: '🌱 轻度研究', desc: '消耗少，收益低', cost: 40 },
            { value: 'medium', label: '🌿 中度研究', desc: '均衡选择', cost: 80 },
            { value: 'heavy', label: '🌳 重度研究', desc: '消耗大，收益高', cost: 140 },
        ];

        showModal(
            '🔬 选择研究强度',
            '研究消耗精力与金钱，全面提升各知识点（不含文化课）',
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
                    if (k.id === 'culture') continue;
                    const bonus = k.bonus || 1.0;
                    k.exp += Math.floor(gain / (state.knowledge.length - 1) * bonus);
                }
                const extra = Math.floor(Math.random() * 5) + 2;
                const d = state.knowledge.filter(k => k.id !== 'culture')[Math.floor(Math.random() * (state.knowledge.length - 1))];
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

    // ----- 觉醒天赋 -----
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

    // ----- 比赛（竞速 + 失败堆叠） -----
    function actionContest() {
        if (state.gameOver || state.contestInProgress || !gameStarted) return;

        const stage = getCurrentStage();
        if (stage.next === null && state.raceEnded) {
            addLog('🏆 你已通关所有赛段！', 'highlight');
            return;
        }

        if (state.stagePassed) {
            const nextStage = RACE_STAGES.find(s => s.id === stage.next);
            if (nextStage) {
                state.currentStage = RACE_STAGES.indexOf(nextStage);
                state.stagePassed = false;
                state.medal = 0;
                if (state.hellMode) {
                    const hellBonus = Math.floor(Math.random() * 10) + 10;
                    state.knowledge.forEach(k => {
                        if (k.id !== 'culture') k.exp += Math.floor(hellBonus / 2);
                    });
                    addLog(`💀 地狱难度晋级奖励：各知识 +${Math.floor(hellBonus/2)}`, 'hell');
                }
                addLog(`🎯 进入 ${nextStage.name} 阶段！`, 'stage');
                updateUI();
                return;
            }
            return;
        }

        const cost = getCost(50);
        if (state.money < cost) { addLog('❌ 金钱不足！', 'danger'); return; }

        state.money -= cost;
        const contestName = `${stage.name} 晋级赛`;

        simulateContest(contestName, () => {
            const totalExp = getTotalExp();
            const stageReq = Math.max(15, stage.reqBase || 20 + state.currentStage * 25) * state.contestReqMod * state.provContestDifficulty;
            const stackBonus = 1 + state.failBonus;
            
            // 地狱难度额外惩罚
            let hellPenalty = 1.0;
            if (state.hellMode) {
                hellPenalty = 0.8;
                addLog(`💀 地狱难度：比赛压力巨大！`, 'hell');
            }
            
            const kf = Math.min(1, totalExp / (stageReq + 50));
            const mf = Math.min(1, state.morale / 80);
            let chance = (0.15 + kf * 0.45 + mf * 0.15) * state.impatientMod * hellPenalty * stackBonus;
            if (state.year === 2) chance += 0.08;

            const hpCost = 8 + state.currentStage * 2;
            state.hp = clamp(state.hp - hpCost * state.stressMod * state.hpDecay, 0, 100);
            state.morale = clamp(state.morale - 3, 0, 100);
            state.totalContest++;

            const roll = Math.random();
            let success = roll < chance;

            if (state.provTyphoon && Math.random() < 0.08) {
                success = false;
                addLog(`🌪️ 台风影响比赛，发挥失常！`, 'danger');
            }

            if (success && state.medal >= 1) {
                state.stagePassed = true;
                const medalReward = state.hellMode ? 2 : 1;
                state.medal = Math.max(0, state.medal - 1);
                // 失败堆叠重置
                state.failStack = 0;
                state.failBonus = 0;
                addLog(`🏆 ${stage.name} 晋级成功！${state.hellMode ? '💀 地狱模式 +1 额外奖牌' : ''}`, 'success');
                
                if (stage.next === null) {
                    state.raceEnded = true;
                    addLog(`🎉 恭喜！你成功入选国家队！`, 'stage');
                } else {
                    addLog(`🎯 下一阶段：${RACE_STAGES.find(s => s.id === stage.next)?.name || '未知'}`, 'highlight');
                }
            } else {
                // 失败处理
                state.medal = Math.max(0, state.medal - 1);
                // 失败堆叠增加
                state.failStack++;
                const bonusRate = Math.min(0.5, state.failStack * 0.03 + state.failStackBonus * 0.5);
                state.failBonus = Math.min(0.5, bonusRate);
                addLog(`💔 ${stage.name} 晋级失败... 失败堆叠 +1 (当前: ${state.failStack})`, 'danger');
                addLog(`📈 下次比赛成功率 +${Math.round(state.failBonus * 100)}%`, 'stack');
                
                // 失败补偿：少量经验
                const comp = Math.floor(Math.random() * 5) + 3;
                state.knowledge.forEach(k => {
                    if (k.id !== 'culture') k.exp += Math.floor(comp / 2);
                });
                addLog(`📚 失败中学习，各知识 +${Math.floor(comp/2)}`, 'highlight');
            }

            // 竞速断裂检查
            if (state.year >= 2 && state.turn > 40 && state.currentStage < 3) {
                state.gameOver = true;
                state.gameOverReason = 'race_broken';
                addLog('💔 竞速断裂：未能通过省选...', 'ending');
                triggerEnding();
                return;
            }

            advanceTurn();
        });
    }

    // ----- 休息 -----
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
            const d = state.knowledge.filter(k => k.id !== 'culture')[Math.floor(Math.random() * (state.knowledge.length - 1))];
            d.exp += learn;
            addLog(`📖 休息时看书 ${d.name} +${learn} 经验`, 'highlight');
        }
        advanceTurn();
    }

    // ----- 社交 -----
    function actionSocial() {
        if (state.gameOver || state.contestInProgress || !gameStarted) return;
        const cost = getCost(40);
        if (state.money < cost) { addLog('❌ 金钱不足！', 'danger'); return; }

        state.money -= cost;
        state.morale = clamp(state.morale + 15, 0, 100);
        state.totalSocial++;
        const learn = Math.floor(Math.random() * 5) + 2;
        const d = state.knowledge.filter(k => k.id !== 'culture')[Math.floor(Math.random() * (state.knowledge.length - 1))];
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

    // ============================================================
    //  20. 回合推进
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
            state.gameOverReason = 'hp';
            gameOverMsg.innerHTML = `<div class="ending-title">💔 精力耗尽</div><div>OI 生涯因过度疲劳而结束...</div>`;
            addLog('💔 精力耗尽，生涯结束', 'danger');
            over = true;
        } else if (state.turn > state.maxTurn) {
            state.gameOver = true;
            state.gameOverReason = 'time';
            over = true;
            triggerEnding();
        } else if (state.year === 2 && state.turn > 42) {
            state.gameOver = true;
            state.gameOverReason = 'time';
            over = true;
            triggerEnding();
        }

        if (over) {
            updateUI();
            return;
        }

        if (!state.gameOver && gameStarted) {
            checkRaceAdvance();
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

        updateUI();
    }

    // ============================================================
    //  21. 特殊事件
    // ============================================================
    const SPECIAL_EVENTS = [
        { type: 'good', weight: 18, msg: '📚 发现珍贵资料，随机知识 +5', effect: (s) => { const d = s.knowledge.filter(k => k.id !== 'culture')[Math.floor(Math.random() * (s.knowledge.length - 1))]; d.exp += 5 * s.expMod; } },
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
        { type: 'bad', weight: 18, msg: '😷 感冒了，精力 -8', effect: (s) => { s.hp = clamp(s.hp - 8 * s.hpDecay, 0, 100); } },
        { type: 'bad', weight: 15, msg: '😤 被老师批评，士气 -10', effect: (s) => { s.morale = clamp(s.morale - 10, 0, 100); } },
        { type: 'bad', weight: 12, msg: '📉 遇到难题，随机知识 -3', effect: (s) => { const d = s.knowledge.filter(k => k.id !== 'culture')[Math.floor(Math.random() * (s.knowledge.length - 1))]; d.exp = Math.max(0, d.exp - 3); } },
        { type: 'bad', weight: 10, msg: '💤 睡眠不足，精力 -5，士气 -5', effect: (s) => { s.hp = clamp(s.hp - 5 * s.hpDecay, 0, 100); s.morale = clamp(s.morale - 5, 0, 100); } },
        { type: 'bad', weight: 8, msg: '🌀 天赋消除！失去一个随机天赋', effect: (s) => {
            const goodTalents = s.talents.filter(t => t.type === 'good');
            if (goodTalents.length > 0) {
                const t = goodTalents[Math.floor(Math.random() * goodTalents.length)];
                removeTalent(t.id);
                addLog(`💔 失去天赋：${t.name}`, 'danger');
            }
        }},
        { type: 'mixed', weight: 12, msg: '⚖️ 精力 -3，随机知识 +4', effect: (s) => { s.hp = clamp(s.hp - 3 * s.hpDecay, 0, 100); const d = s.knowledge.filter(k => k.id !== 'culture')[Math.floor(Math.random() * (s.knowledge.length - 1))]; d.exp += 4 * s.expMod; } },
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
    //  22. 菜单交互
    // ============================================================
    function setupMenu() {
        const diffOptions = document.querySelectorAll('#difficultyOptions .menu-option');
        diffOptions.forEach(el => {
            el.addEventListener('click', function(e) {
                e.stopPropagation();
                diffOptions.forEach(o => o.classList.remove('selected'));
                this.classList.add('selected');
                selectedDifficulty = this.dataset.value;
                updateAllDetails();
            });
        });

        const provOptions = document.querySelectorAll('#provinceOptions .menu-option');
        provOptions.forEach(el => {
            el.addEventListener('click', function(e) {
                e.stopPropagation();
                provOptions.forEach(o => o.classList.remove('selected'));
                this.classList.add('selected');
                selectedProvince = this.dataset.value;
                updateAllDetails();
            });
        });

        const charOptions = document.querySelectorAll('#characterOptions .menu-option');
        charOptions.forEach(el => {
            el.addEventListener('click', function(e) {
                e.stopPropagation();
                charOptions.forEach(o => o.classList.remove('selected'));
                this.classList.add('selected');
                selectedCharacter = this.dataset.value;
                updateAllDetails();
            });
        });

        updateAllDetails();
    }

    function updateAllDetails() {
        updateProvinceDetail();
        updateCharacterDetail();
    }

    function updateProvinceDetail() {
        const prov = PROVINCES[selectedProvince];
        const detailEl = document.getElementById('provinceDetail');
        if (prov) {
            detailEl.innerHTML = `
                <div class="detail-name">${prov.name}</div>
                <div class="detail-desc">${prov.desc}</div>
                <div class="detail-stats">
                    <span>💰 金钱: ${prov.stats.moneyBonus >= 1 ? '+' : ''}${Math.round((prov.stats.moneyBonus - 1) * 100)}%</span>
                    <span>⚔️ 难度: ${prov.stats.contestDifficulty >= 1 ? '+' : ''}${Math.round((prov.stats.contestDifficulty - 1) * 100)}%</span>
                    <span>📚 文化课: ${prov.stats.cultureBonus >= 1 ? '+' : ''}${Math.round((prov.stats.cultureBonus - 1) * 100)}%</span>
                    ${prov.stats.typhoon ? '<span>🌪️ 台风: 有</span>' : ''}
                </div>
            `;
        }
    }

    function updateCharacterDetail() {
        const char = CHARACTERS[selectedCharacter];
        const detailEl = document.getElementById('characterDetail');
        if (char) {
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
                <div style="font-size:11px;opacity:0.6;margin-top:3px;">
                    🎯 难度: ${DIFFICULTIES[selectedDifficulty]?.label || '普通'}
                    ${DIFFICULTIES[selectedDifficulty]?.hellMode ? ' 💀 地狱模式' : ''}
                </div>
            `;
        }
    }

    // ============================================================
    //  23. 重置游戏
    // ============================================================
    function resetGame() {
        initState();

        logArea.innerHTML = '';
        gameOverMsg.style.display = 'none';
        gameOverMsg.innerHTML = '';
        updateUI();

        [trainBtn, contestBtn, restBtn, researchBtn, socialBtn, studyBtn, awakenBtn].forEach(btn => {
            btn.disabled = true;
        });

        showMenu();
    }

    // ============================================================
    //  24. 菜单控制
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
    //  25. 初始化
    // ============================================================
    function init() {
        setupMenu();

        trainBtn.addEventListener('click', actionTrain);
        contestBtn.addEventListener('click', actionContest);
        restBtn.addEventListener('click', actionRest);
        researchBtn.addEventListener('click', actionResearch);
        socialBtn.addEventListener('click', actionSocial);
        studyBtn.addEventListener('click', actionStudy);
        awakenBtn.addEventListener('click', actionAwaken);
        resetBtn.addEventListener('click', resetGame);

        startGameBtn.addEventListener('click', function() {
            initState();
            hideMenu();
            gameStarted = true;
            state.gameOver = false;

            const charName = CHARACTERS[selectedCharacter]?.name || '选手';
            const provName = PROVINCES[selectedProvince]?.name || '';
            const diffLabel = DIFFICULTIES[selectedDifficulty]?.label || '普通';
            const hellNote = DIFFICULTIES[selectedDifficulty]?.hellMode ? ' 💀 地狱模式' : '';
            logArea.innerHTML = '';
            addLog(`🧑‍💻 ${charName} · ${provName} · ${diffLabel}${hellNote}`, 'highlight');
            addLog(`🏆 竞速路线：CSP → NOIP → 省选 → NOI → 国家队`, 'stage');
            addLog(`⏱️ ${state.maxTurn} 回合 (约 ${Math.round(state.maxTurn * 0.2)} 分钟)`);
            addLog('📝 文化课达到 S 级可触发文化课结局');
            addLog('💡 每阶段需获得 1 枚奖牌才能晋级');
            if (state.hellMode) {
                addLog('💀 地狱难度：失败堆叠效果减半，但通关奖励翻倍！', 'hell');
            }

            [trainBtn, contestBtn, restBtn, researchBtn, socialBtn, studyBtn, awakenBtn].forEach(btn => {
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