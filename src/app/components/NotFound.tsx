import { Link } from "react-router";
import { Button } from "./ui/button.js";
import { Home, ArrowLeft } from "lucide-react";

export function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md mx-auto">
        <div className="mb-8">
          <h1 className="text-9xl font-bold bg-gradient-to-br from-purple-600 to-pink-600 bg-clip-text text-transparent">
            404
          </h1>
        </div>
        <h2 className="mb-4">Page Not Found</h2>
        <p className="text-muted-foreground mb-8">
          Oops! The page you're looking for doesn't exist. It might have been moved
          or deleted.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild>
            <Link to="/">
              <Home className="mr-2 size-4" />
              Go Home
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/portfolio">
              <ArrowLeft className="mr-2 size-4" />
              View Portfolio
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
