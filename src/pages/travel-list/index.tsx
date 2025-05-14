import React, { useState, useEffect } from 'react';
import { TravelNote, TravelNoteStatus, TravelNoteDetail } from '@/types';
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { api } from '@/api';
import { useAuth } from '@/utils/AuthContext';
import { getTravelNoteStatus, setTravelNoteStatus, markAsDeleted } from '@/utils/quick-tag.ts';
import ImageGrid from './components/images-gird.tsx';


const TravelNoteList: React.FC = () => {
    const [travelNotes, setTravelNotes] = useState<TravelNote[]>([]);
    const [travelNoteDetails, setTravelNoteDetails] = useState<TravelNoteDetail | null >(null)
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [dialogMode, setDialogMode] = useState<'reject' | 'view' | 'deleted' | 'edit-rejected' | 'edit-approved' | null>(null);
    const [selectedNote, setSelectedNote] = useState<TravelNote | null>(null);
    const [rejectReason, setRejectReason] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [loadingStatus, setLoadingStatus] = useState(false);
    const [isApproved, setIsApproved] = useState(false);
    const { isAdmin } = useAuth();

    const fetchTravelNotes = async () => {
        setLoading(true);
        try {
            if(statusFilter === 'all') {
                const res = await api.getTravelNotes(currentPage, itemsPerPage);
                setTravelNotes(res.items)
                setTotalPages(res.totalPages)
            } else if(statusFilter === TravelNoteStatus.PENDING) {
                const res = await api.getTravelNotesPending(currentPage, itemsPerPage);
                setTravelNotes(res.items)
                setTotalPages(res.totalPages)
            } else if(statusFilter === TravelNoteStatus.APPROVED) {
                const res = await api.getTravelNotesApproved(currentPage, itemsPerPage);
                setTravelNotes(res.items)
                setTotalPages(res.totalPages)
            } else if(statusFilter === TravelNoteStatus.REJECTED) {
                const res = await api.getTravelNotesRejected(currentPage, itemsPerPage);
                setTravelNotes(res.items)
                setTotalPages(res.totalPages)
            }

        } catch (error) {
            toast.error('获取游记列表失败');
            console.error('Failed to fetch travel notes:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTravelNotes();
    }, [statusFilter, currentPage, itemsPerPage]);
    
    useEffect(() => {
        setCurrentPage(1);
    }, [itemsPerPage]);

    // 获取游记详情
    const fetchTravelNoteDetails = async (id: string) => {
        setLoadingStatus(true);
        try {
            const noteDetails = await api.getTrvelNoteDetails(id);
            setTravelNoteDetails(noteDetails);
        } catch (error) {
            toast.error('获取游记详情失败');
            console.error('Failed to fetch travel note details:', error);
        } finally {
            setLoadingStatus(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case TravelNoteStatus.PENDING:
                return <Badge variant="outline" className="bg-yellow-100">待审核</Badge>;
            case TravelNoteStatus.APPROVED:
                return <Badge variant="outline" className="bg-green-100">已通过</Badge>;
            case TravelNoteStatus.REJECTED:
                return <Badge variant="outline" className="bg-red-100">未通过</Badge>;
            default:
                return <Badge variant="outline">未知</Badge>;
        }
    };

    // 通过游记
    const handleApprove = async (noteId: string, quickTag:number) => {
        setLoadingStatus(true)
        try {
            const settingStatus:number = setTravelNoteStatus(TravelNoteStatus.APPROVED, quickTag)
            await api.auditTravelNote(noteId, settingStatus);
            setTravelNotes(prevNotes =>
                prevNotes.map(note =>
                    note.id === noteId
                        ? { ...note, quickTag: settingStatus }
                        : note
                )
            );
            toast.success("审核已通过！");
            setIsDialogOpen(false)
        } catch (error) {
            toast.error('操作失败');
            console.error('Failed to approve note:', error);
        } finally {
            setLoadingStatus(false)
        }
    };

    // 打开查看游记菜单
    const handleViewContent = async (note: TravelNote) => {
        setSelectedNote(note);
        setDialogMode('view');
        setIsDialogOpen(true);
        setTravelNoteDetails(null)
        try {
            await fetchTravelNoteDetails(note.id);
            console.log(travelNoteDetails)
        } catch (error) {
            toast.error('获取游记详情失败');
            console.error('Failed to fetch travel note details:', error);
        }
    };

    // 打开拒绝游记菜单
    const handleOpenRejectDialog = (note: TravelNote) => {
        setSelectedNote(note);
        setDialogMode('reject');
        setRejectReason('');
        setIsDialogOpen(true);
    };

    // 打开删除游记菜单
    const handleOpenDeleteDialog = (note: TravelNote) => {
        setSelectedNote(note)
        setDialogMode('deleted')
        setIsDialogOpen(true);
    };

    // 拒绝游记
    const handleReject = async () => {
        if (!rejectReason.trim()) {
            toast.error("请填写拒绝原因");
            return;
        }

        if (selectedNote) {
            setLoadingStatus(true)
            try {
                const settingStatus:number = setTravelNoteStatus(TravelNoteStatus.REJECTED, Number(selectedNote.quickTag))
                await api.auditTravelNote(selectedNote.id, settingStatus, rejectReason);
                setTravelNotes(prevNotes =>
                    prevNotes.map(note =>
                        note.id === selectedNote.id
                            ? { ...note, quickTag: settingStatus, rejectReason }
                            : note
                    )
                );
                toast.success("已拒绝该游记");
                console.log(travelNotes)
                setIsDialogOpen(false);
                setRejectReason('');
            } catch (error) {
                toast.error('操作失败');
                console.error('Failed to reject note:', error);
            } finally {
                setLoadingStatus(false)
            }
        }
    };

    // 删除游记
    const handleConfirmDelete = async () => {
        if (selectedNote) {
            setLoading(true)
            try {
                const settingStatus:number = markAsDeleted(selectedNote.quickTag)
                await api.auditTravelNote(selectedNote.id, settingStatus);

                // 删除成功后刷新列表数据
                fetchTravelNotes()

                toast.success("已成功删除");
                setIsDialogOpen(false)
            } catch (error) {
                toast.error('删除失败');
                console.error('Failed to delete note:', error);
            } finally {
                setLoading(false)
            }
        }
    };

    // 打开修改已拒绝游记菜单
    const handleEditRejectedNote = (note: TravelNote) => {
        setSelectedNote(note);
        setDialogMode('edit-rejected');
        setRejectReason(note.rejectReason || '');
        setIsDialogOpen(true);
    };

    // 打开修改已通过游记菜单
    const handleEditApprovedNote = (note: TravelNote) => {
        setSelectedNote(note);
        setDialogMode('edit-approved');
        setRejectReason('');
        setIsDialogOpen(true);
    };


    return (
        <div className="space-y-6 w-full py-5 px-15 bg-white shadow-md rounded-lg outline-none select-none">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">游记列表</h1>
                <div className="flex items-center gap-2">
                    <span>状态筛选：</span>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-32">
                            <SelectValue placeholder="所有状态" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">所有状态</SelectItem>
                            <SelectItem value={TravelNoteStatus.PENDING}>待审核</SelectItem>
                            <SelectItem value={TravelNoteStatus.APPROVED}>已通过</SelectItem>
                            <SelectItem value={TravelNoteStatus.REJECTED}>未通过</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[200px]">标题</TableHead>
                        <TableHead className="w-[150px]">作者</TableHead>
                        <TableHead className="w-[200px]">创建时间</TableHead>
                        <TableHead className="w-[100px]">状态</TableHead>
                        <TableHead className="text-right">操作</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {loadingStatus && (
                        <TableRow>
                            <TableCell className="fixed z-100 inset-0">
                                <div className="flex items-center justify-center h-full">
                                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-500"></div>
                                </div>
                            </TableCell>
                        </TableRow>
                    )}
                    {loading ? (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center py-6">
                                <div className="flex items-center justify-center h-full">
                                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-500"></div>
                                </div>
                            </TableCell>
                        </TableRow>
                    ) : travelNotes.length > 0 ? (
                        travelNotes.map((note) => (
                            <TableRow key={note.id}>
                                <TableCell>{note.title}</TableCell>
                                <TableCell>{note.author.username}</TableCell>
                                <TableCell>{new Date(note.date).toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-')}</TableCell>
                                <TableCell>{getStatusBadge(getTravelNoteStatus(Number(note.quickTag)))}</TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleViewContent(note)}
                                        >
                                            查看
                                        </Button>
                                        {(getTravelNoteStatus(Number(note.quickTag)) === TravelNoteStatus.PENDING || getTravelNoteStatus(Number(note.quickTag)) === TravelNoteStatus.NONE) && (
                                            <>
                                                <Button
                                                    variant="default"
                                                    size="sm"
                                                    onClick={() => handleApprove(note.id, Number(note.quickTag))}
                                                >
                                                    通过
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => handleOpenRejectDialog(note)}
                                                >
                                                    拒绝
                                                </Button>
                                            </>
                                        )}
                                        {
                                            getTravelNoteStatus(Number(note.quickTag)) === TravelNoteStatus.REJECTED && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleEditRejectedNote(note) }
                                                >
                                                    修改
                                                </Button>
                                            )
                                        }
                                        {
                                            getTravelNoteStatus(Number(note.quickTag)) === TravelNoteStatus.APPROVED && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleEditApprovedNote(note) }
                                                >
                                                    修改
                                                </Button>
                                            )
                                        }
                                        {isAdmin && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="text-red-500"
                                                onClick={() => handleOpenDeleteDialog(note)}
                                            >
                                                删除
                                            </Button>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center py-6">
                                暂无游记数据
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>

            <div className="flex justify-between items-center">

                <Pagination>
                    <div className="flex items-center gap-2">
                        <Select value={String(itemsPerPage)} onValueChange={(value) => setItemsPerPage(Number(value))}>
                            <SelectTrigger className="w-24">
                                <SelectValue placeholder="条数"/>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="3">3条/页</SelectItem>
                                <SelectItem value="5">5条/页</SelectItem>
                                <SelectItem value="10">10条/页</SelectItem>
                                <SelectItem value="20">20条/页</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
                            />
                        </PaginationItem>
                        {[...Array(totalPages)].map((_, index) => (
                            <PaginationItem key={index}>
                                <PaginationLink
                                    onClick={() => setCurrentPage(index + 1)}
                                    isActive={currentPage === index + 1}
                                >
                                    {index + 1}
                                </PaginationLink>
                            </PaginationItem>
                        ))}
                        <PaginationItem>
                            <PaginationNext
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                className={currentPage >= totalPages ? "pointer-events-none opacity-50" : ""}
                            />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>


            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent
                    className={
                        'transition-all ' +
                        (dialogMode === 'view' ? 'max-w-4xl h-5/6 overflow-hidden' : '') +
                        (dialogMode === 'deleted' ? 'max-w-md' : '') +
                        (dialogMode === 'reject' ? 'max-w-md' : '') +
                        (dialogMode === 'edit-rejected' ? 'max-w-md' : '') +
                        (dialogMode === 'edit-approved' ? 'max-w-md' : '')
                    }
                >
                    <DialogHeader>
                        <DialogTitle>
                            {dialogMode === 'view' ? '游记详情' : 
                             dialogMode === 'deleted' ? '确认删除' : 
                             dialogMode === 'edit-rejected' ? '修改已拒绝游记' : 
                             dialogMode === 'edit-approved' ? '修改已通过游记' : 
                             '请填写拒绝原因'}
                        </DialogTitle>
                    </DialogHeader>

                    {dialogMode === 'view' && travelNoteDetails && (
                        <ScrollArea className="space-y-4 w-full h-150 p-3 border rounded-lg">
                            {getTravelNoteStatus(travelNoteDetails.quick_tag) === TravelNoteStatus.REJECTED && (
                                <h3 className="font-semibold text-red-500">已拒绝：{travelNoteDetails.rejectReason}
                                </h3>
                            )}
                            {getTravelNoteStatus(travelNoteDetails.quick_tag) === TravelNoteStatus.APPROVED && (
                                <h3 className="font-semibold text-green-500">已通过
                                </h3>
                            )}
                            <div className="flex justify-between items-center">
                                <h2 className="text-gray-600 font-bold">标题：{travelNoteDetails.title}</h2>
                                <p className="text-gray-600">作者：{travelNoteDetails.author.username}</p>
                                <p className="text-gray-600">发布时间：{new Date(travelNoteDetails.date).toLocaleString('zh-CN', {hour12: false}).replace(/\//g, '-')}</p>
                            </div>

                            <p className="mt-4"
                                dangerouslySetInnerHTML={{
                                    __html: travelNoteDetails.content.replace(/\n/g, '<br />') }}
                            ></p>

                            {travelNoteDetails.video && (
                                <div className="mt-4">
                                    <video controls className="w-full rounded-lg">
                                        <source src={travelNoteDetails.video} type="video/mp4" />
                                        您的浏览器不支持视频播放。
                                    </video>
                                </div>
                            )}
                            <div className="flex justify-center mt-6">
                                <ImageGrid images={travelNoteDetails.images} />
                            </div>


                        </ScrollArea>
                    )}

                    {dialogMode === 'reject' && (
                        <div className="space-y-4">
                            <div>
                                <h3 className="font-semibold mb-2">游记标题：{selectedNote?.title}</h3>
                            </div>
                            <div>
                                <label htmlFor="rejectReason" className="font-medium">
                                    拒绝原因 <span className="text-red-500">*</span>
                                </label>
                                <Textarea
                                    id="rejectReason"
                                    placeholder="请详细说明拒绝原因..."
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    className="mt-1"
                                />
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                                    取消
                                </Button>
                                <Button variant="destructive" onClick={handleReject}>
                                    确认拒绝
                                </Button>
                            </DialogFooter>
                        </div>
                    )}

                    {dialogMode === 'deleted' && (
                        <div className="space-y-4">
                            <div className="py-3">
                                <p>确定要删除这篇游记吗？此操作无法撤销。</p>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                                    取消
                                </Button>
                                <Button variant="destructive" onClick={handleConfirmDelete}>
                                    确认删除
                                </Button>
                            </DialogFooter>
                        </div>
                    )}
                    
                    {/* 修改已拒绝游记的对话框 */}
                    {dialogMode === 'edit-rejected' && selectedNote && (
                        <div className="space-y-4">
                            <div>
                                <h3 className="font-semibold mb-2">游记标题：{selectedNote.title}</h3>
                            </div>
                            <div>
                                <h4 className="font-medium mb-2">当前操作选项：</h4>
                                <div className="flex gap-4">
                                    <Button
                                        variant={isApproved ? "default" : "outline"}
                                        onClick={() => setIsApproved(true)}
                                    >
                                        修改为通过
                                    </Button>
                                    <Button
                                        variant={isApproved ? "outline" : "default"}
                                        onClick={() => {
                                            // 切换到修改拒绝原因模式
                                            setIsApproved(false);
                                            document.getElementById('rejectedReasonTextarea')?.focus();
                                        }}
                                    >
                                        仅修改拒绝原因
                                    </Button>
                                </div>
                            </div>

                            {
                                isApproved ? (
                                    <DialogFooter>
                                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                                            取消
                                        </Button>
                                        <Button variant="default" onClick={() => handleApprove(selectedNote.id, Number(selectedNote.quickTag))}>
                                            确认通过
                                        </Button>
                                    </DialogFooter>
                                ) : (
                                    <>
                                        <div className="pt-2">
                                            <label htmlFor="rejectedReasonTextarea" className="font-medium">
                                                拒绝原因 <span className="text-red-500">*</span>
                                            </label>
                                            <Textarea
                                                id="rejectedReasonTextarea"
                                                placeholder="请详细说明拒绝原因..."
                                                value={rejectReason}
                                                onChange={(e) => setRejectReason(e.target.value)}
                                                className="mt-1"
                                            />
                                        </div>
                                        <DialogFooter>
                                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                                                取消
                                            </Button>
                                            <Button variant="destructive" onClick={handleReject}>
                                                更新拒绝原因
                                            </Button>
                                        </DialogFooter>
                                    </>
                                )
                            }

                        </div>
                    )}

                    {/* 修改已通过游记的对话框 */}
                    {dialogMode === 'edit-approved' && selectedNote && (
                        <div className="space-y-4">
                            <div>
                                <h3 className="font-semibold mb-2">游记标题：{selectedNote.title}</h3>
                                <p className="text-green-600 font-medium">当前状态：已通过</p>
                            </div>
                            <div>
                                <h4 className="font-medium">若需修改为拒绝状态，请填写拒绝原因：</h4>
                                <Textarea
                                    placeholder="请详细说明拒绝原因..."
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    className="mt-1"
                                />
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                                    取消
                                </Button>
                                <Button variant="destructive" onClick={handleReject}>
                                    修改为拒绝状态
                                </Button>
                            </DialogFooter>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

        </div>
    );
};

export default TravelNoteList;