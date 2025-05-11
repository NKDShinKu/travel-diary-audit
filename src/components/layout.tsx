import React, { useEffect, useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/utils/AuthContext';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const Layout: React.FC = () => {
    const { currentUser, logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

    // 检查用户是否已登录
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
        }
    }, [isAuthenticated, navigate]);

    // 打开退出确认对话框
    const handleLogoutClick = () => {
        setLogoutDialogOpen(true);
    };

    // 处理确认登出
    const handleConfirmLogout = () => {
        logout();
        toast.success('已成功退出');
        setLogoutDialogOpen(false);
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-100 bg-gradient-to-b from-blue-50 to-white">
            {/* 导航栏 */}
            <nav className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            <div className="flex-shrink-0 flex items-center">
                                <Link to="/" className="text-xl font-bold text-blue-600">
                                    游记审核系统
                                </Link>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <div className="hidden md:block">
                                <div className="ml-4 flex items-center md:ml-6">
                  <span className="text-sm text-gray-700 mr-2">
                    欢迎， {currentUser?.username}
                  </span>
                                    <button
                                        onClick={handleLogoutClick}
                                        className="ml-3 px-3 py-1 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200"
                                    >
                                        退出
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* 内容区域 */}
            <main className="py-10 ">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <Outlet />
                </div>
            </main>

            {/* 退出确认对话框 */}
            <Dialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>确认退出</DialogTitle>
                    </DialogHeader>
                    <div className="py-3">
                        <p>确定要退出登录吗？</p>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setLogoutDialogOpen(false)}>
                            取消
                        </Button>
                        <Button variant="destructive" onClick={handleConfirmLogout}>
                            确认退出
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Layout;