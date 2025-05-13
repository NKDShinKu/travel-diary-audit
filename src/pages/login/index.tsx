import {useEffect, useState} from "react"
import { useForm } from "react-hook-form"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/utils/AuthContext"

type LoginFormValues = {
    username: string
    password: string
}

export default function LoginForm() {

    const form = useForm<LoginFormValues>({
        defaultValues: {
            username: "",
            password: "",
        },
    })
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()
    const { login, isAuthenticated } = useAuth()

    // 检查用户是否已登录
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/');
        }
    }, [isAuthenticated, navigate]);

    const onSubmit = async (values: LoginFormValues) => {
        setLoading(true)
        try {
            await login(values.username, values.password)
            toast.success("登录成功！")
            navigate('/')
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "登录失败")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-blue-50 to-white px-4 py-12 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8">
                <div className="rounded-2xl bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-blue-100">
                    <div>
                        <h2 className="mt-2 text-center text-3xl font-bold tracking-tight text-gray-900">
                            游记审核系统
                        </h2>
                    </div>


                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 ">
                            <div className="space-y-4">
                                {/* 用户名字段 */}
                                <FormField
                                    control={form.control}
                                    name="username"
                                    rules={{ required: "用户名不能为空！" }}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>用户名</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="请输入用户名"
                                                    type="text"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* 密码字段 */}
                                <FormField
                                    control={form.control}
                                    name="password"
                                    rules={{ required: "密码不能为空！" }}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>密码</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="请输入密码"
                                                    type="password"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* 提交按钮 */}
                            <Button
                                type="submit"
                                className="group relative flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500  focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:bg-blue-400 transition-colors duration-200"
                                disabled={loading}
                            >
                                {loading ? "登录中..." : "登录"}
                            </Button>
                        </form>
                    </Form>
                </div>
            </div>
        </div>
    )
}
