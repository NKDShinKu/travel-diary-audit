import React, { useState, useEffect } from 'react';
import { TravelNote, TravelNoteStatus, UserRole } from '@/types';
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

// 模拟获取当前用户信息
const mockCurrentUser = {
    id: 1,
    username: 'admin',
    role: UserRole.ADMIN
};

// 模拟游记数据
const mockTravelNotes: TravelNote[] = [
    {
        id: 1,
        title: '北京三日游',
        content: '故宫、长城、颐和园一网打尽',
        authorName: '张三',
        createdAt: '2023-10-01',
        status: TravelNoteStatus.PENDING,
        isDeleted: false
    },
    {
        id: 2,
        title: '上海美食之旅',
        content: '品尝各种上海本地美食',
        authorName: '李四',
        createdAt: '2023-09-15',
        status: TravelNoteStatus.APPROVED,
        isDeleted: false
    },
    {
        id: 3,
        title: '成都休闲游记',
        content: '悠闲的熊猫之旅',
        authorName: '王五',
        createdAt: '2023-09-10',
        status: TravelNoteStatus.REJECTED,
        rejectReason: '内容不完整',
        isDeleted: false
    },
    {
        id: 4,
        title: '三亚海滩度假',
        content: '美丽的海滩和阳光',
        authorName: '赵六',
        createdAt: '2023-08-20',
        status: TravelNoteStatus.PENDING,
        isDeleted: false
    },
        {
        id: 5,
        title: '三亚海滩度假',
        content: '美丽的海滩和阳光',
        authorName: '赵六',
        createdAt: '2023-08-20',
        status: TravelNoteStatus.PENDING,
        isDeleted: false
    },
        {
        id: 6,
        title: '三亚海滩度假',
        content: '美丽的海滩和阳光',
        authorName: '赵六',
        createdAt: '2023-08-20',
        status: TravelNoteStatus.PENDING,
        isDeleted: false
    },
        {
        id: 7,
        title: '三亚海滩度假',
        content: '美丽的海滩和阳光',
        authorName: '赵六',
        createdAt: '2023-08-20',
        status: TravelNoteStatus.PENDING,
        isDeleted: false
    },
        {
        id: 8,
        title: '三亚海滩度假',
        content: '美丽的海滩和阳光',
        authorName: '赵六',
        createdAt: '2023-08-20',
        status: TravelNoteStatus.PENDING,
        isDeleted: false
    },
        {
        id: 9,
        title: '三亚海滩度假',
        content: '美丽的海滩和阳光',
        authorName: '赵六',
        createdAt: '2023-08-20',
        status: TravelNoteStatus.PENDING,
        isDeleted: false
    },
        {
        id: 10,
        title: '三亚海滩度假',
        content: '美丽的海滩和阳光',
        authorName: '赵六',
        createdAt: '2023-08-20',
        status: TravelNoteStatus.PENDING,
        isDeleted: false
    },
        {
        id: 11,
        title: '三亚海滩度假',
        content: '美丽的海滩和阳光',
        authorName: '赵六',
        createdAt: '2023-08-20',
        status: TravelNoteStatus.PENDING,
        isDeleted: false
    },
        {
        id: 12,
        title: '三亚海滩度假',
        content: '美丽的海滩和阳光',
        authorName: '赵六',
        createdAt: '2023-08-20',
        status: TravelNoteStatus.PENDING,
        isDeleted: false
    },
        {
        id: 13,
        title: '三亚海滩度假',
        content: '美丽的海滩和阳光',
        authorName: '赵六',
        createdAt: '2023-08-20',
        status: TravelNoteStatus.PENDING,
        isDeleted: false
    },
        {
        id: 14,
        title: '三亚海滩度假',
        content: '美丽的海滩和阳光',
        authorName: '赵六',
        createdAt: '2023-08-20',
        status: TravelNoteStatus.PENDING,
        isDeleted: false
    },

];

const TravelNoteList: React.FC = () => {
    const [travelNotes, setTravelNotes] = useState<TravelNote[]>([]);
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [dialogMode, setDialogMode] = useState<'reject' | 'view' | null>(null);
    const [selectedNote, setSelectedNote] = useState<TravelNote | null>(null);
    const [rejectReason, setRejectReason] = useState('');
    // 增加删除确认对话框状态
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [noteToDelete, setNoteToDelete] = useState<number | null>(null);
    // 添加每页显示条数状态
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // 移除常量定义，改为使用状态
    const currentUser = mockCurrentUser;

    // 获取游记列表数据
    useEffect(() => {
        // 模拟API请求
        const fetchTravelNotes = () => {
            // 应用过滤器
            let filteredNotes = [...mockTravelNotes].filter(note => !note.isDeleted);

            if (statusFilter !== "all") {
                filteredNotes = filteredNotes.filter(note => note.status === statusFilter);
            }

            const totalItems = filteredNotes.length;
            setTotalPages(Math.ceil(totalItems / itemsPerPage));

            // 分页
            const startIndex = (currentPage - 1) * itemsPerPage;
            const paginatedNotes = filteredNotes.slice(startIndex, startIndex + itemsPerPage);

            setTravelNotes(paginatedNotes);
        };

        fetchTravelNotes();
    }, [statusFilter, currentPage, itemsPerPage]);
    
    // 当每页显示条数变化时，重置到第一页
    useEffect(() => {
        setCurrentPage(1);
    }, [itemsPerPage]);

    // 获取状态对应的显示文本和样式
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

    // 处理查看内容
    const handleViewContent = (note: TravelNote) => {
        setSelectedNote(note);
        setDialogMode('view');
        setIsDialogOpen(true);
    };

    // 处理审核通过
    const handleApprove = (noteId: number) => {
        setTravelNotes(prevNotes =>
            prevNotes.map(note =>
                note.id === noteId
                    ? { ...note, status: TravelNoteStatus.APPROVED }
                    : note
            )
        );
        toast.success("审核已通过！");
    };

    // 打开拒绝对话框
    const handleOpenRejectDialog = (note: TravelNote) => {
        setSelectedNote(note);
        setDialogMode('reject');
        setRejectReason('');
        setIsDialogOpen(true);
    };

    // 提交拒绝
    const handleReject = () => {
        if (!rejectReason.trim()) {
            toast.error("请填写拒绝原因");
            return;
        }

        if (selectedNote) {
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
        }
    };

// 打开删除确认对话框
    const handleOpenDeleteDialog = (noteId: number) => {
        setNoteToDelete(noteId);
        setDeleteDialogOpen(true);
    };

// 处理删除确认
    const handleConfirmDelete = () => {
        if (noteToDelete) {
            setTravelNotes(prevNotes =>
                prevNotes.map(note =>
                    note.id === noteToDelete
                        ? { ...note, isDeleted: true }
                        : note
                ).filter(note => !note.isDeleted)
            );
            toast.success("已成功删除");
            setDeleteDialogOpen(false);
        }
    };

    // 判断当前用户是否为管理员
    const isAdmin = currentUser.role === UserRole.ADMIN;

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

            <Table className="outline-none select-none" >
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
                    {travelNotes.length > 0 ? (
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
                    {/* 每页显示条数选择 */}
                    <div className="flex items-center gap-2">
                        <Select value={String(itemsPerPage)} onValueChange={(value) => setItemsPerPage(Number(value))}>
                            <SelectTrigger className="w-24">
                                <SelectValue placeholder="条数" />
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

            {/* 对话框用于查看内容和拒绝原因 */}
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

            {/* 删除确认对话框 */}
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