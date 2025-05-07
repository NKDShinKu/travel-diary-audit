import { Outlet } from "react-router-dom";

const Layout = () => {
    return (
        <>
            <div className="h-15 bg-amber-300">
                header
            </div>
            <Outlet />
        </>

    );
}

export default Layout