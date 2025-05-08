import { TravelNote, TravelNoteStatus, TravelNoteStatusType, User, UserRole } from '@/types';

// 模拟数据
const mockTravelNotes: TravelNote[] = [
    {
        id: 1,
        title: '我的北京之行',
        content: '在北京，我参观了故宫、长城等著名景点...',
        authorName: '张三',
        createdAt: '2025-04-28',
        status: TravelNoteStatus.PENDING,
        isDeleted: false
    },
    {
        id: 2,
        title: '上海旅游记录',
        content: '上海是一座现代化的大都市，外滩的夜景非常漂亮...',
        authorName: '李四',
        createdAt: '2025-05-01',
        status: TravelNoteStatus.APPROVED,
        isDeleted: false
    },
    {
        id: 3,
        title: '成都美食之旅',
        content: '成都的火锅和小吃真是让人难忘...',
        authorName: '王五',
        createdAt: '2025-05-02',
        status: TravelNoteStatus.REJECTED,
        rejectReason: '内容不够详细，需要添加更多景点描述',
        isDeleted: false
    },
    {
        id: 4,
        title: '杭州西湖游记',
        content: '西湖的美景让人陶醉，断桥残雪尤为壮观...',
        authorName: '赵六',
        createdAt: '2025-05-03',
        status: TravelNoteStatus.PENDING,
        isDeleted: false
    },
    {
        id: 5,
        title: '广州长隆游玩体验',
        content: '长隆野生动物园和欢乐世界都很有趣...',
        authorName: '孙七',
        createdAt: '2025-05-04',
        status: TravelNoteStatus.APPROVED,
        isDeleted: false
    },
    {
        id: 6,
        title: '西安历史文化游',
        content: '参观了兵马俑、大雁塔，感受到了浓厚的历史底蕴...',
        authorName: '周八',
        createdAt: '2025-05-05',
        status: TravelNoteStatus.PENDING,
        isDeleted: false
    },
    {
        id: 7,
        title: '丽江古城漫步',
        content: '古城的小巷充满了文艺气息，夜晚的灯光也很迷人...',
        authorName: '吴九',
        createdAt: '2025-05-06',
        status: TravelNoteStatus.APPROVED,
        isDeleted: false
    },
    {
        id: 8,
        title: '青岛啤酒节回忆',
        content: '和朋友们畅饮啤酒，还去了海边踏浪，好开心喵~',
        authorName: '郑十',
        createdAt: '2025-05-06',
        status: TravelNoteStatus.REJECTED,
        rejectReason: '语言表达不清晰，建议润色内容',
        isDeleted: false
    },
    {
        id: 9,
        title: '桂林山水甲天下',
        content: '漓江的水清澈见底，山峰如画，拍了很多美照喵~',
        authorName: '钱十一',
        createdAt: '2025-05-07',
        status: TravelNoteStatus.APPROVED,
        isDeleted: false
    },
    {
        id: 10,
        title: '南京文化探索',
        content: '中山陵和总统府令人印象深刻，历史氛围浓厚...',
        authorName: '孙十二',
        createdAt: '2025-05-07',
        status: TravelNoteStatus.PENDING,
        isDeleted: false
    },
    {
        id: 11,
        title: '三亚海边度假记',
        content: '沙滩阳光和海风，还有椰子水，度假感拉满喵！',
        authorName: '李十三',
        createdAt: '2025-05-08',
        status: TravelNoteStatus.APPROVED,
        isDeleted: false
    },
    {
        id: 12,
        title: '张家界奇峰异石探秘',
        content: '山势奇险、云雾缭绕，有种置身仙境的感觉喵~',
        authorName: '周十四',
        createdAt: '2025-05-08',
        status: TravelNoteStatus.REJECTED,
        rejectReason: '照片数量太少，建议补充配图',
        isDeleted: false
    },
    {
        id: 13,
        title: '厦门鼓浪屿一日游',
        content: '鼓浪屿的风情建筑和小吃超有味道，还买了特产喵~',
        authorName: '吴十五',
        createdAt: '2025-05-08',
        status: TravelNoteStatus.APPROVED,
        isDeleted: false
    },
    {
        id: 14,
        title: '重庆夜景与火锅',
        content: '山城夜景超震撼，火锅辣得过瘾！值得再去！',
        authorName: '郑十六',
        createdAt: '2025-05-08',
        status: TravelNoteStatus.PENDING,
        isDeleted: false
    },
    {
        id: 15,
        title: '台湾自由行',
        content: '台北夜市小吃丰富，高雄海边的落日太浪漫了喵~',
        authorName: '钱十七',
        createdAt: '2025-05-08',
        status: TravelNoteStatus.APPROVED,
        isDeleted: false
    }

];

// 模拟用户数据
const mockUsers: User[] = [
    {
        id: 1,
        username: 'admin',
        role: UserRole.ADMIN
    },
    {
        id: 2,
        username: 'reviewer',
        role: UserRole.REVIEWER
    }
];

// 模拟延迟
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// API服务
export const api = {
    // 登录
    login: async (username: string, password: string): Promise<User> => {
        await delay(500);
        const user = mockUsers.find(u => u.username === username);

        if (!user || password !== '123456') { // 简单密码用于测试
            throw new Error('用户名或密码错误');
        }

        return {
            ...user,
            token: `mock-token-${user.username}-${Date.now()}`
        };
    },

    // 获取游记列表
    getTravelNotes: async (status?: TravelNoteStatusType): Promise<TravelNote[]> => {
        await delay(500);
        return mockTravelNotes.filter(note =>
            !note.isDeleted && (status === undefined || note.status === status)
        );
    },

    // 审核通过
    approveTravelNote: async (id: number): Promise<void> => {
        await delay(500);
        const note = mockTravelNotes.find(note => note.id === id);
        if (note) {
            note.status = TravelNoteStatus.APPROVED;
        }
    },

    // 审核拒绝
    rejectTravelNote: async (id: number, reason: string): Promise<void> => {
        await delay(500);
        const note = mockTravelNotes.find(note => note.id === id);
        if (note) {
            note.status = TravelNoteStatus.REJECTED;
            note.rejectReason = reason;
        }
    },

    // 逻辑删除
    deleteTravelNote: async (id: number): Promise<void> => {
        await delay(500);
        const note = mockTravelNotes.find(note => note.id === id);
        if (note) {
            note.isDeleted = true;
        }
    }
};