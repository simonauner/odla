import { Link, Outlet, createRootRoute, createRoute, createRouter } from "@tanstack/react-router";
import { useSession } from "./lib/auth";
import { LoginPage } from "./routes/login";
import { AddCropsPage } from "./routes/add-crops";
import { CropPage } from "./routes/crop";
import { CropsPage } from "./routes/crops";
import { PlacePage } from "./routes/place";
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
            <Link to="/odlingar" className={navLink}>
              Odlingar
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
  createRoute({ getParentRoute: () => rootRoute, path: "/odlingar", component: CropsPage }),
  createRoute({
    getParentRoute: () => rootRoute,
    path: "/odlingar/ny",
    component: AddCropsPage,
    validateSearch: (search: Record<string, unknown>): { plats?: string } =>
      typeof search.plats === "string" ? { plats: search.plats } : {},
  }),
  createRoute({ getParentRoute: () => rootRoute, path: "/odling/$plantingId", component: CropPage }),
  createRoute({ getParentRoute: () => rootRoute, path: "/plats/$gardenId", component: PlacePage }),
  createRoute({ getParentRoute: () => rootRoute, path: "/profil", component: ProfilePage }),
]);

export const router = createRouter({ routeTree, basepath: "/app" });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
