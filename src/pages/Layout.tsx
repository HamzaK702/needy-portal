import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import { Outlet, useLocation } from "react-router-dom";

const Layout = ({ userData }) => {
  const { pathname } = useLocation();

  return (
    <div className="min-h-screen bg-background flex w-full">
      {pathname !== "/welcome" ? (
        <>
          <Sidebar userData={userData} />
          <div className="flex-1 flex flex-col min-w-0">
            <Header />
            <main className="flex-1 overflow-auto">
              <Outlet />
            </main>
          </div>{" "}
        </>
      ) : (
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      )}
    </div>
  );
};

export default Layout;
