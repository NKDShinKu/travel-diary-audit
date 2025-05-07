// 游记状态
export const TravelNoteStatus = {
    PENDING: 'pending', // 待审核
    APPROVED: 'approved', // 已通过
    REJECTED: 'rejected', // 未通过
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
    role: UserRoleType;
    token?: string;
}

// 游记类型定义
export interface TravelNote {
    id: number;
    title: string;
    content: string;
    authorName: string;
    createdAt: string;
    status: TravelNoteStatusType;
    rejectReason?: string; // 拒绝原因
    isDeleted: boolean; // 逻辑删除标记
}