// 游记状态
export const TravelNoteStatus = {
    PENDING: '32', // 待审核
    APPROVED: '64', // 已通过
    REJECTED: '16', // 未通过
    DELETED: '8', // 已删除
    ALL: '0', // 全部
} as const;

// 游记状态类型定义
export type TravelNoteStatusType = typeof TravelNoteStatus[keyof typeof TravelNoteStatus];


// 用户角色
export const UserRole = {
    ADMIN: 'admin',
    REVIEWER: 'reviewer',
} as const;

// 用户角色类型定义
export type UserRoleType = typeof UserRole[keyof typeof UserRole];

// 用户类型定义
export interface User {
    id: number;
    username: string;
    userGroup: UserRoleType;
    email: string;
}

// 游记类型定义
export interface TravelNote {
    id: number;
    title: string;
    date: string;
    coverImage?: string;
    quickTag: TravelNoteStatusType;
    rejectReason?: string; // 拒绝原因
    author: {
        username: string;
    }
}


export interface TravelNoteDetail {
    id: string;
    title: string;
    content: string;
    date: string;
    images: string[];
    video?: string | null;
    rejectReason?: string | null; // 拒绝原因
    coverImage?: string | null;
    quick_tag: TravelNoteStatusType;
    author: {
        username: string;
    }
}