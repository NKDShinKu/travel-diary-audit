import { TravelNoteDetail, ResponseTravelNote } from '@/types';
import request from '@/utils/request';

// API服务
export const api = {
    login: (username: string, password: string) => {
        return request.post('/auth/signin', { username, password })
    },

    getTravelNotes: (page?: number, limit?: number): Promise<ResponseTravelNote> => {
        return request.get('/posts/list', { params: { page, limit } })
    },

    // 获取各种状态的游记列表
    getTravelNotesApproved: (page?: number, limit?: number): Promise<ResponseTravelNote> => {
        return request.get('/posts/list/approved', { params: { page, limit } })
    },

    getTravelNotesPending: (page?: number, limit?: number): Promise<ResponseTravelNote> => {
        return request.get('/posts/list/pending', { params: { page, limit } })
    },

    getTravelNotesRejected: (page?: number, limit?: number): Promise<ResponseTravelNote> => {
        return request.get('/posts/list/rejected', { params: { page, limit } })
    },

    getTrvelNoteDetails: (id: string): Promise<TravelNoteDetail> => {
        return request.get(`/posts/${id}`)
    },

    // 审核游记
    auditTravelNote: async (id: string, auditStatus:number, rejectReason?:string): Promise<void> => {
        return request.post(`/posts/${id}/audit`, { auditStatus, rejectReason })
    },


};