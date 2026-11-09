import { Link, Outlet, createRootRoute, createRoute, createRouter } from "@tanstack/react-router";
import { PlanPage } from "./routes/plan";
import { SetupPage } from "./routes/setup";

const rootRoute = createRootRoute({
  component: () => (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <header className="mb-8 flex items-baseline justify-between">
        <Link to="/" className="text-2xl font-semibold text-leaf-700">Odla</Link>
        <nav className="flex gap-4 text-sm">
          <Link to="/" className="[&.active]:font-semibold">Min plan</Link>
          <Link to="/setup" className="[&.active]:font-semibold">Zon och grödor</Link>
        </nav>
      </header>
      <Outlet />
    </div>
  ),
});

const routeTree = rootRoute.addChildren([
  createRoute({ getParentRoute: () => rootRoute, path: "/", component: PlanPage }),
  createRoute({ getParentRoute: () => rootRoute, path: "/setup", component: SetupPage }),
]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
