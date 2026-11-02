import {Link, Outlet} from "react-router-dom";
import {Logo} from "@/shared/ui/logo.tsx";

export function AuthLayout() {
    return (
        <div className="grid h-svh lg:grid-cols-2 overflow-hidden w-full">
            <div className="flex flex-col h-full overflow-hidden min-h-0">
                <div className="flex justify-center gap-2 md:justify-start shrink-0 p-4 md:p-8 mb-2">
                    <Link to="#">
                        <Logo size={"lg"}/>
                    </Link>
                </div>
                <div
                    className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-muted-foreground/20 hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/40 px-4 md:px-8 pb-10">
                    <div className="mx-auto w-full max-w-xl">
                        <Outlet/>
                    </div>
                </div>
            </div>
            <div className="relative hidden bg-muted lg:block h-full">
                <img
                    src="https://res.cloudinary.com/koivlyas/image/upload/v1793573447/Duvia_Personalized_Learning_Glow.png"
                    alt="Authentication Background"
                    className="absolute h-full w-full object-cover "
                />
            </div>
        </div>
    )
}