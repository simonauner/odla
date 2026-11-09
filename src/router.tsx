import { Link, Outlet, createRootRoute, createRoute, createRouter } from "@tanstack/react-router";
import { useSession } from "./lib/auth";
import { LoginPage } from "./routes/login";
import { PlanPage } from "./routes/plan";
import { ProfilePage } from "./routes/profile";
import { SetupPage } from "./routes/setup";

const navLink = "hover:text-foreground [&.active]:font-semibold [&.active]:text-foreground";

function Root() {
  const session = useSession();
  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <header className="mb-8 flex flex-wrap items-baseline justify-between gap-2">
        <Link to="/" className="text-2xl font-semibold text-primary">
          Odla
        </Link>
        {session && (
          <nav className="flex items-baseline gap-4 text-sm text-muted-foreground">
            <Link to="/" className={navLink}>
              Min plan
            </Link>
            <Link to="/setup" className={navLink}>
              Zon och grödor
            </Link>
            <Link to="/profil" className={navLink}>
              Profil
            </Link>
          </nav>
        )}
      </header>
      {session === undefined ? null : session === null ? <LoginPage /> : <Outlet />}
    </div>
  );
}

const rootRoute = createRootRoute({ component: Root });

const routeTree = rootRoute.addChildren([
  createRoute({ getParentRoute: () => rootRoute, path: "/", component: PlanPage }),
  createRoute({ getParentRoute: () => rootRoute, path: "/setup", component: SetupPage }),
  createRoute({ getParentRoute: () => rootRoute, path: "/profil", component: ProfilePage }),
]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
