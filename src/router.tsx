import { Link, Outlet, createRootRoute, createRoute, createRouter } from "@tanstack/react-router";
import { useSession } from "./lib/auth";
import { LoginPage } from "./routes/login";
import { PlacePage } from "./routes/place";
import { PlacesPage } from "./routes/places";
import { PlanPage } from "./routes/plan";
import { ProfilePage } from "./routes/profile";
import { SetupPage } from "./routes/setup";

const navLink = "hover:text-foreground [&.active]:font-semibold [&.active]:text-foreground";

function Root() {
  const session = useSession();
  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-2">
        <Link to="/" className="inline-flex shrink-0">
          <img src="/grodla-logo.svg" alt="Grodla" width={148} height={36} />
        </Link>
        {session && (
          <nav className="flex items-center gap-4 text-sm text-muted-foreground">
            <Link to="/" className={navLink}>
              Min plan
            </Link>
            <Link to="/platser" className={navLink}>
              Odlingsplatser
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
  createRoute({ getParentRoute: () => rootRoute, path: "/platser", component: PlacesPage }),
  createRoute({ getParentRoute: () => rootRoute, path: "/plats/$seasonId", component: PlacePage }),
  createRoute({ getParentRoute: () => rootRoute, path: "/profil", component: ProfilePage }),
]);

export const router = createRouter({ routeTree, basepath: "/app" });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
