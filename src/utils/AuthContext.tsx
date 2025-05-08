import { createContext, useContext, useState, type ReactNode } from 'react';
import { User, UserRole } from '@/types';
import { api } from '@/api';

// 认证上下文类型
interface AuthContextType {
    currentUser: User | null;
    login: (username: string, password: string) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
    isAdmin: boolean;
    isReviewer: boolean;
}

// 创建上下文
const AuthContext = createContext<AuthContextType | null>(null);

// 认证提供者组件
export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);

    // 从localStorage加载用户数据
    useState(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            try {
                setCurrentUser(JSON.parse(savedUser));
            } catch (e) {
                console.error('Failed to parse user from localStorage', e);
                localStorage.removeItem('user');
            }
        }
    });

    // 登录方法
    const login = async (username: string, password: string) => {
        const user = await api.login(username, password);
        setCurrentUser(user);
        localStorage.setItem('user', JSON.stringify(user));
    };

    // 登出方法
    const logout = () => {
        setCurrentUser(null);
        localStorage.removeItem('user');
    };

    // 判断是否已认证
    const isAuthenticated = !!currentUser;

    // 判断是否为管理员
    const isAdmin = currentUser?.role === UserRole.ADMIN;

    // 判断是否为审核人员 (审核人员或管理员都能审核)
    const isReviewer = isAdmin || currentUser?.role === UserRole.REVIEWER;

    const value = {
        currentUser,
        login,
        logout,
        isAuthenticated,
        isAdmin,
        isReviewer,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 自定义hook，用于访问认证上下文
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth必须在AuthProvider内部使用');
    }
    return context;
};