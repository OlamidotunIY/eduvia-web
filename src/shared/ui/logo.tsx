import {cn} from "cn";
import eduviaLogo from "../../assets/eduvia-logo.png";

const iconSizes = {
    sm: "size-4",
    md: "size-6",
    lg: "size-8",
    xl: "size-10"
}

const textSizes = {
    sm: "text-sm",
    md: "text-lg",
    lg: "text-xl",
    xl: "text-2xl"
} as const;

export interface LogoProps extends React.HTMLAttributes<HTMLDivElement> {
    size?: keyof typeof iconSizes;
    textColor?: string;
}

const Logo = ({size = "md", textColor, className, ...props}: LogoProps) => {
    return (
        <div className={cn("flex items-center font-medium", className)} {...props}>
            <div
                className={cn("flex items-center justify-center rounded-sm overflow-hidden shrink-0", iconSizes[size])}>
                <img src={eduviaLogo}
                     alt="Eduvia logo" className="w-full h-full object-contain"/>
            </div>
            <p className={cn(textSizes[size], textColor, 'logo font-bold')}>duvia</p>
        </div>
    )
}

export {
    Logo
}
