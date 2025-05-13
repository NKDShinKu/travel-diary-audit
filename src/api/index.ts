import { TravelNote, TravelNoteStatusType, TravelNoteDetail } from '@/types';
import request from '@/utils/request';

interface responseTravelNote {
    items: TravelNote[];
}

// API服务
export const api = {
    login: (username: string, password: string) => {
        return request.post('/auth/signin', { username, password })
    },

    getTravelNotes: (status?: TravelNoteStatusType): Promise<responseTravelNote> => {
        console.log(status)
        return request.get('/posts/list')
    },

    getTrvelNoteDetails: (id: string): Promise<TravelNoteDetail> => {
        return request.get(`/posts/${id}`)
    },

    // 审核游记
    auditTravelNote: async (id: string, auditStatus:number, rejectReason?:string): Promise<void> => {
        return request.post(`/posts/${id}/audit`, { auditStatus, rejectReason })
    },

    // // 审核通过
    // approveTravelNote: async (id: number): Promise<void> => {
    //     return request.post(`/posts/${id}/audit`, { auditStatus: TravelNoteStatus.APPROVED  })
    // },
    //
    // // 审核拒绝
    // rejectTravelNote: async (id: number, rejectReason: string): Promise<void> => {
    //     return request.post(`/posts/${id}/audit`, { auditStatus: TravelNoteStatus.REJECTED, rejectReason })
    // },
    //
    // // 逻辑删除
    // deleteTravelNote: async (id: number): Promise<void> => {
    //     return request.post(`/posts/${id}/audit`, { auditStatus: TravelNoteStatus.DELETED })
    // }

};