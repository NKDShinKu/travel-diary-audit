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
    const [currentToken, setCurrentToken] = useState<string | null>(null);
    // 从localStorage加载用户数据
    useState(() => {
        const savedUser = localStorage.getItem('userInfo');
        setCurrentToken(localStorage.getItem('token'));
        if (savedUser) {
            try {
                setCurrentUser(JSON.parse(savedUser));
            } catch (e) {
                console.error('Failed to parse user from localStorage', e);
                localStorage.removeItem('userInfo');
            }
        }
    });

    // 登录方法
    const login = async (username: string, password: string) => {
        try {
            const res = await api.login(username, password);
            // 检查响应格式是否符合预期
            if (!res || !res.data || !res.data.token) {
                throw new Error('登录响应格式不正确');
            }
            const user = res.data;
            setCurrentUser(user.userInfo);
            setCurrentToken(user.token);
            localStorage.setItem('userInfo', JSON.stringify(user.userInfo));
            localStorage.setItem('token', user.token);
            localStorage.setItem('refreshToken', user.refreshToken);
        } catch (error) {
            console.error('登录失败:', error);
            // 检查是否为跨域错误 (无法直接检测 CORS 错误，但可以检查特定的属性)
            if (error instanceof Error && error.message.includes('Network Error')) {
                throw new Error('网络请求失败');
            }
            throw error; // 重新抛出错误以便上层组件处理
        }
    };

    // 登出方法
    const logout = () => {
        setCurrentUser(null);
        localStorage.removeItem('userInfo');
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
    };

    const isAuthenticated = !!currentToken;  // 判断是否已认证
    const isAdmin = currentUser?.userGroup === UserRole.ADMIN;  // 判断是否为管理员
    const isReviewer = isAdmin || currentUser?.userGroup === UserRole.REVIEWER;  // 判断是否为审核人员 (审核人员或管理员都能审核)

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