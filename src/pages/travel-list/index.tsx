import React, { useState, useEffect } from 'react';
import { TravelNote, TravelNoteStatus, TravelNoteStatusType } from '@/types';
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

const TravelNoteList: React.FC = () => {
    const [travelNotes, setTravelNotes] = useState<TravelNote[]>([]);
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [dialogMode, setDialogMode] = useState<'reject' | 'view' | null>(null);
    const [selectedNote, setSelectedNote] = useState<TravelNote | null>(null);
    const [rejectReason, setRejectReason] = useState('');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [noteToDelete, setNoteToDelete] = useState<number | null>(null);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [loading, setLoading] = useState(false);

    const { isAdmin } = useAuth();

    useEffect(() => {
        const fetchTravelNotes = async () => {
            setLoading(true);
            try {
                let notes: TravelNote[];
                if (statusFilter === "all") {
                    notes = await api.getTravelNotes();
                } else {
                    notes = await api.getTravelNotes(statusFilter as TravelNoteStatusType);
                }

                const totalItems = notes.length;
                setTotalPages(Math.ceil(totalItems / itemsPerPage));

                const startIndex = (currentPage - 1) * itemsPerPage;
                const paginatedNotes = notes.slice(startIndex, startIndex + itemsPerPage);

                setTravelNotes(paginatedNotes);
            } catch (error) {
                toast.error('获取游记列表失败');
                console.error('Failed to fetch travel notes:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTravelNotes();
    }, [statusFilter, currentPage, itemsPerPage]);
    
    useEffect(() => {
        setCurrentPage(1);
    }, [itemsPerPage]);

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

    const handleViewContent = (note: TravelNote) => {
        setSelectedNote(note);
        setDialogMode('view');
        setIsDialogOpen(true);
    };

    const handleApprove = async (noteId: number) => {
        try {
            await api.approveTravelNote(noteId);
            setTravelNotes(prevNotes =>
                prevNotes.map(note =>
                    note.id === noteId
                        ? { ...note, status: TravelNoteStatus.APPROVED }
                        : note
                )
            );
            toast.success("审核已通过！");
        } catch (error) {
            toast.error('操作失败');
            console.error('Failed to approve note:', error);
        }
    };

    const handleOpenRejectDialog = (note: TravelNote) => {
        setSelectedNote(note);
        setDialogMode('reject');
        setRejectReason('');
        setIsDialogOpen(true);
    };

    const handleReject = async () => {
        if (!rejectReason.trim()) {
            toast.error("请填写拒绝原因");
            return;
        }

        if (selectedNote) {
            try {
                await api.rejectTravelNote(selectedNote.id, rejectReason);
                setTravelNotes(prevNotes =>
                    prevNotes.map(note =>
                        note.id === selectedNote.id
                            ? { ...note, status: TravelNoteStatus.REJECTED, rejectReason }
                            : note
                    )
                );
                toast.success("已拒绝该游记");
                setIsDialogOpen(false);
                setRejectReason('');
            } catch (error) {
                toast.error('操作失败');
                console.error('Failed to reject note:', error);
            }
        }
    };

    const handleOpenDeleteDialog = (noteId: number) => {
        setNoteToDelete(noteId);
        setDeleteDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (noteToDelete) {
            try {
                await api.deleteTravelNote(noteToDelete);
                setTravelNotes(prevNotes =>
                    prevNotes.filter(note => note.id !== noteToDelete)
                );
                toast.success("已成功删除");
                setDeleteDialogOpen(false);
            } catch (error) {
                toast.error('删除失败');
                console.error('Failed to delete note:', error);
            }
        }
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
                    {loading ? (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center py-6">
                                加载中...
                            </TableCell>
                        </TableRow>
                    ) : travelNotes.length > 0 ? (
                        travelNotes.map((note) => (
                            <TableRow key={note.id}>
                                <TableCell>{note.title}</TableCell>
                                <TableCell>{note.authorName}</TableCell>
                                <TableCell>{note.createdAt}</TableCell>
                                <TableCell>{getStatusBadge(note.status)}</TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleViewContent(note)}
                                        >
                                            查看
                                        </Button>
                                        {note.status === TravelNoteStatus.PENDING && (
                                            <>
                                                <Button
                                                    variant="default"
                                                    size="sm"
                                                    onClick={() => handleApprove(note.id)}
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
                                        {isAdmin && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="text-red-500"
                                                onClick={() => handleOpenDeleteDialog(note.id)}
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
                <DialogContent className="max-w-xl">
                    <DialogHeader>
                        <DialogTitle>
                            {dialogMode === 'view' ? '游记内容' : '请填写拒绝原因'}
                        </DialogTitle>
                    </DialogHeader>

                    {dialogMode === 'view' && selectedNote && (
                        <div className="space-y-4">
                            <div>
                                <h3 className="font-semibold">标题</h3>
                                <p>{selectedNote.title}</p>
                            </div>
                            <div>
                            <h3 className="font-semibold">作者</h3>
                                <p>{selectedNote.authorName}</p>
                            </div>
                            <div>
                                <h3 className="font-semibold">内容</h3>
                                <p className="whitespace-pre-wrap">{selectedNote.content}</p>
                            </div>
                            {selectedNote.status === TravelNoteStatus.REJECTED && (
                                <div>
                                    <h3 className="font-semibold">拒绝原因</h3>
                                    <p className="text-red-500">{selectedNote.rejectReason}</p>
                                </div>
                            )}
                        </div>
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
                </DialogContent>
            </Dialog>

            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>确认删除</DialogTitle>
                    </DialogHeader>
                    <div className="py-3">
                        <p>确定要删除这篇游记吗？此操作无法撤销。</p>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                            取消
                        </Button>
                        <Button variant="destructive" onClick={handleConfirmDelete}>
                            确认删除
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default TravelNoteList;