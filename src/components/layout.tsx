import React from 'react';
import { Link, Outlet } from 'react-router-dom';

const Layout: React.FC = () => {


    return (
        <div className="min-h-screen bg-gray-100">
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
                    欢迎， admin
                  </span>
                                    <button

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
            <main className="py-10">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;