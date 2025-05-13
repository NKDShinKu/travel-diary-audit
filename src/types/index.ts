// 游记状态
export const TravelNoteStatus = {
    APPROVED: 'approved',
    PENDING: 'pending',
    REJECTED: 'rejected',
    DELETED: 'deleted',
    NONE: 'none'
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
    id: string;
    title: string;
    date: string;
    coverImage?: string;
    quickTag: number;
    rejectReason?: string; // 拒绝原因
    author: {
        username: string;
        avatar?: string | null;
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
    quick_tag: number;
    author: {
        username: string;
        avatar?: string | null;
    }
}

export interface ResponseTravelNote {
    items: TravelNote[];
    total: number;
    page: number;
    totalPages: number;
    hasMore: boolean;
}