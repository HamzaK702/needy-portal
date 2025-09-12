import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bell, MessageSquare, Search } from "lucide-react";

const Header = () => {
  return (
    <header className="h-16 bg-white border-b border-border flex items-center justify-between px-6">
      {/* Search  input */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search cases, donors, or reports..."
            className="pl-10 bg-muted/50 border-0"
          />
        </div>
      </div>

      {/* Message icon and notifications */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" className="relative">
          <MessageSquare className="w-4 h-4" />
          <Badge
            variant="destructive"
            className="absolute -top-2 -right-2 w-5 h-5 text-xs flex items-center justify-center p-0"
          >
            3
          </Badge>
        </Button>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="w-4 h-4" />
          <Badge
            variant="destructive"
            className="absolute -top-2 -right-2 w-5 h-5 text-xs flex items-center justify-center p-0"
          >
            5
          </Badge>
        </Button>
      </div>
    </header>
  );
};

export default Header;
