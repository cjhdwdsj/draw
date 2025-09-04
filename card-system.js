/**
 * 实况足球手机版抽卡系统
 * PES Mobile Card Pack System
 */

class PESCardSystem {
    constructor() {
        this.playersData = null;
        this.userInventory = [];
        this.userCurrency = {
            GP: 100000,
            硬币: 500
        };
        this.loadPlayersData();
    }

    // 加载球员数据
    async loadPlayersData() {
        try {
            const response = await fetch('players_data_complete.json');
            this.playersData = await response.json();
            console.log('球员数据加载成功');
        } catch (error) {
            console.error('加载球员数据失败:', error);
        }
    }

    // 获取用户货币
    getUserCurrency() {
        return this.userCurrency;
    }

    // 消费货币
    spendCurrency(type, amount) {
        if (this.userCurrency[type] >= amount) {
            this.userCurrency[type] -= amount;
            return true;
        }
        return false;
    }

    // 获取抽卡包信息
    getPackInfo(packType) {
        if (!this.playersData) return null;
        return this.playersData.抽卡包类型[packType];
    }

    // 执行抽卡
    openPack(packType) {
        const packInfo = this.getPackInfo(packType);
        if (!packInfo) {
            throw new Error('无效的卡包类型');
        }

        // 检查货币是否足够
        if (!this.spendCurrency(packInfo.货币, packInfo.价格)) {
            throw new Error(`${packInfo.货币}不足，需要${packInfo.价格}`);
        }

        // 确定稀有度
        const rarity = this.determineRarity(packInfo.稀有度概率);
        
        // 从对应稀有度中随机选择球员
        const player = this.getRandomPlayerByRarity(rarity);
        
        // 添加到用户库存
        this.addToInventory(player);
        
        return {
            player: player,
            rarity: rarity,
            cost: {
                currency: packInfo.货币,
                amount: packInfo.价格
            }
        };
    }

    // 确定稀有度
    determineRarity(probabilities) {
        const random = Math.random() * 100;
        let cumulativeProbability = 0;
        
        for (const [rarity, probability] of Object.entries(probabilities)) {
            cumulativeProbability += probability;
            if (random <= cumulativeProbability) {
                return rarity;
            }
        }
        
        // 默认返回最低稀有度
        return Object.keys(probabilities)[0];
    }

    // 根据稀有度获取随机球员
    getRandomPlayerByRarity(rarity) {
        if (!this.playersData) return null;
        
        // 从示例数据中筛选对应稀有度的球员
        const availablePlayers = this.playersData.球员示例数据.filter(
            player => player.稀有度 === rarity
        );
        
        if (availablePlayers.length === 0) {
            // 如果没有对应稀有度的球员，生成一个随机球员
            return this.generateRandomPlayer(rarity);
        }
        
        const randomIndex = Math.floor(Math.random() * availablePlayers.length);
        return { ...availablePlayers[randomIndex] };
    }

    // 生成随机球员
    generateRandomPlayer(rarity) {
        const rarityInfo = this.playersData.稀有度等级[rarity];
        const positions = Object.keys(this.playersData.位置信息);
        const randomPosition = positions[Math.floor(Math.random() * positions.length)];
        
        // 根据稀有度确定能力范围
        const abilityRange = rarityInfo.综合能力范围.split('-');
        const minAbility = parseInt(abilityRange[0]);
        const maxAbility = parseInt(abilityRange[1]);
        const overall = Math.floor(Math.random() * (maxAbility - minAbility + 1)) + minAbility;
        
        return {
            id: Math.floor(Math.random() * 10000) + 1000,
            姓名: this.generateRandomName(),
            英文名: 'RANDOM PLAYER',
            稀有度: rarity,
            综合能力: overall,
            位置: randomPosition,
            副位置: [],
            年龄: Math.floor(Math.random() * 15) + 18,
            身高: Math.floor(Math.random() * 30) + 165,
            体重: Math.floor(Math.random() * 25) + 60,
            惯用脚: Math.random() > 0.5 ? '右脚' : '左脚',
            俱乐部: '未知俱乐部',
            国籍: '未知',
            能力值: this.generateRandomAbilities(overall),
            特殊技能: [],
            战术风格: '均衡型',
            球员类型: '全能型'
        };
    }

    // 生成随机姓名
    generateRandomName() {
        const surnames = ['王', '李', '张', '刘', '陈', '杨', '赵', '黄', '周', '吴'];
        const names = ['伟', '强', '磊', '军', '勇', '峰', '杰', '涛', '明', '超'];
        
        const surname = surnames[Math.floor(Math.random() * surnames.length)];
        const name = names[Math.floor(Math.random() * names.length)];
        
        return surname + name;
    }

    // 生成随机能力值
    generateRandomAbilities(overall) {
        const baseValue = overall - 20;
        const variation = 40;
        
        return {
            进攻感知: Math.max(1, Math.min(99, baseValue + Math.floor(Math.random() * variation))),
            球感: Math.max(1, Math.min(99, baseValue + Math.floor(Math.random() * variation))),
            传中: Math.max(1, Math.min(99, baseValue + Math.floor(Math.random() * variation))),
            短传: Math.max(1, Math.min(99, baseValue + Math.floor(Math.random() * variation))),
            长传: Math.max(1, Math.min(99, baseValue + Math.floor(Math.random() * variation))),
            射门: Math.max(1, Math.min(99, baseValue + Math.floor(Math.random() * variation))),
            定位球: Math.max(1, Math.min(99, baseValue + Math.floor(Math.random() * variation))),
            曲球: Math.max(1, Math.min(99, baseValue + Math.floor(Math.random() * variation))),
            头球: Math.max(1, Math.min(99, baseValue + Math.floor(Math.random() * variation))),
            速度: Math.max(1, Math.min(99, baseValue + Math.floor(Math.random() * variation))),
            加速: Math.max(1, Math.min(99, baseValue + Math.floor(Math.random() * variation))),
            带球: Math.max(1, Math.min(99, baseValue + Math.floor(Math.random() * variation))),
            抢断: Math.max(1, Math.min(99, baseValue + Math.floor(Math.random() * variation))),
            防守感知: Math.max(1, Math.min(99, baseValue + Math.floor(Math.random() * variation))),
            身体接触: Math.max(1, Math.min(99, baseValue + Math.floor(Math.random() * variation))),
            跳跃: Math.max(1, Math.min(99, baseValue + Math.floor(Math.random() * variation))),
            体力: Math.max(1, Math.min(99, baseValue + Math.floor(Math.random() * variation))),
            门将: Math.max(1, Math.min(99, Math.floor(Math.random() * 30)))
        };
    }

    // 添加到库存
    addToInventory(player) {
        this.userInventory.push({
            ...player,
            获得时间: new Date().toISOString(),
            是否新获得: true
        });
    }

    // 获取用户库存
    getInventory() {
        return this.userInventory;
    }

    // 按稀有度筛选库存
    getInventoryByRarity(rarity) {
        return this.userInventory.filter(player => player.稀有度 === rarity);
    }

    // 获取库存统计
    getInventoryStats() {
        const stats = {
            总数量: this.userInventory.length,
            按稀有度分类: {}
        };

        this.userInventory.forEach(player => {
            const rarity = player.稀有度;
            if (!stats.按稀有度分类[rarity]) {
                stats.按稀有度分类[rarity] = 0;
            }
            stats.按稀有度分类[rarity]++;
        });

        return stats;
    }

    // 十连抽
    openTenPack(packType) {
        const results = [];
        let totalCost = 0;
        
        try {
            for (let i = 0; i < 10; i++) {
                const result = this.openPack(packType);
                results.push(result);
                totalCost += result.cost.amount;
            }
            
            return {
                results: results,
                totalCost: totalCost,
                currency: results[0].cost.currency
            };
        } catch (error) {
            // 如果中途余额不足，返回已抽到的结果
            return {
                results: results,
                totalCost: totalCost,
                error: error.message
            };
        }
    }

    // 保存数据到本地存储
    saveToLocalStorage() {
        const saveData = {
            inventory: this.userInventory,
            currency: this.userCurrency,
            saveTime: new Date().toISOString()
        };
        
        localStorage.setItem('pesCardSystemData', JSON.stringify(saveData));
    }

    // 从本地存储加载数据
    loadFromLocalStorage() {
        try {
            const savedData = localStorage.getItem('pesCardSystemData');
            if (savedData) {
                const data = JSON.parse(savedData);
                this.userInventory = data.inventory || [];
                this.userCurrency = data.currency || { GP: 100000, 硬币: 500 };
                console.log('用户数据加载成功');
            }
        } catch (error) {
            console.error('加载用户数据失败:', error);
        }
    }

    // 重置用户数据
    resetUserData() {
        this.userInventory = [];
        this.userCurrency = { GP: 100000, 硬币: 500 };
        localStorage.removeItem('pesCardSystemData');
    }

    // 获取稀有度颜色
    getRarityColor(rarity) {
        const colorMap = {
            '白球': '#CCCCCC',
            '铜球': '#CD7F32',
            '银球': '#C0C0C0',
            '金球': '#FFD700',
            '黑球': '#2C2C2C',
            '传奇': '#8B00FF'
        };
        return colorMap[rarity] || '#CCCCCC';
    }

    // 获取稀有度CSS类名
    getRarityCssClass(rarity) {
        const classMap = {
            '白球': 'white-ball',
            '铜球': 'bronze-ball',
            '银球': 'silver-ball',
            '金球': 'gold-ball',
            '黑球': 'black-ball',
            '传奇': 'legend-ball'
        };
        return classMap[rarity] || 'white-ball';
    }
}

// 导出类供其他文件使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PESCardSystem;
} else if (typeof window !== 'undefined') {
    window.PESCardSystem = PESCardSystem;
}

// 使用示例
console.log('实况足球抽卡系统已加载');

// 创建全局实例
if (typeof window !== 'undefined') {
    window.pesCardSystem = new PESCardSystem();
}
