import { Route as rootRouteImport } from './routes/__root'
import { Route as OnboardingRouteImport } from './routes/onboarding'
import { Route as GroupsRouteImport } from './routes/groups'
import { Route as CreateRouteImport } from './routes/create'
import { Route as AuthRouteImport } from './routes/auth'
import { Route as AssignmentsRouteImport } from './routes/assignments'
import { Route as IndexRouteImport } from './routes/index'
import { Route as ViewIdRouteImport } from './routes/view.$id'

const OnboardingRoute = OnboardingRouteImport.update({
  id: '/onboarding',
  path: '/onboarding',
  getParentRoute: () => rootRouteImport,
} as any)
const GroupsRoute = GroupsRouteImport.update({
  id: '/groups',
  path: '/groups',
  getParentRoute: () => rootRouteImport,
} as any)
const CreateRoute = CreateRouteImport.update({
  id: '/create',
  path: '/create',
  getParentRoute: () => rootRouteImport,
} as any)
const AuthRoute = AuthRouteImport.update({
  id: '/auth',
  path: '/auth',
  getParentRoute: () => rootRouteImport,
} as any)
const AssignmentsRoute = AssignmentsRouteImport.update({
  id: '/assignments',
  path: '/assignments',
  getParentRoute: () => rootRouteImport,
} as any)
const IndexRoute = IndexRouteImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => rootRouteImport,
} as any)
const ViewIdRoute = ViewIdRouteImport.update({
  id: '/view/$id',
  path: '/view/$id',
  getParentRoute: () => rootRouteImport,
} as any)

export interface FileRoutesByFullPath {
  '/': typeof IndexRoute
  '/assignments': typeof AssignmentsRoute
  '/auth': typeof AuthRoute
  '/create': typeof CreateRoute
  '/groups': typeof GroupsRoute
  '/onboarding': typeof OnboardingRoute
  '/view/$id': typeof ViewIdRoute
}
export interface FileRoutesByTo {
  '/': typeof IndexRoute
  '/assignments': typeof AssignmentsRoute
  '/auth': typeof AuthRoute
  '/create': typeof CreateRoute
  '/groups': typeof GroupsRoute
  '/onboarding': typeof OnboardingRoute
  '/view/$id': typeof ViewIdRoute
}
export interface FileRoutesById {
  __root__: typeof rootRouteImport
  '/': typeof IndexRoute
  '/assignments': typeof AssignmentsRoute
  '/auth': typeof AuthRoute
  '/create': typeof CreateRoute
  '/groups': typeof GroupsRoute
  '/onboarding': typeof OnboardingRoute
  '/view/$id': typeof ViewIdRoute
}
export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths:
    | '/'
    | '/assignments'
    | '/auth'
    | '/create'
    | '/groups'
    | '/onboarding'
    | '/view/$id'
  fileRoutesByTo: FileRoutesByTo
  to:
    | '/'
    | '/assignments'
    | '/auth'
    | '/create'
    | '/groups'
    | '/onboarding'
    | '/view/$id'
  id:
    | '__root__'
    | '/'
    | '/assignments'
    | '/auth'
    | '/create'
    | '/groups'
    | '/onboarding'
    | '/view/$id'
  fileRoutesById: FileRoutesById
}
export interface RootRouteChildren {
  IndexRoute: typeof IndexRoute
  AssignmentsRoute: typeof AssignmentsRoute
  AuthRoute: typeof AuthRoute
  CreateRoute: typeof CreateRoute
  GroupsRoute: typeof GroupsRoute
  OnboardingRoute: typeof OnboardingRoute
  ViewIdRoute: typeof ViewIdRoute
}

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/onboarding': {
      id: '/onboarding'
      path: '/onboarding'
      fullPath: '/onboarding'
      preLoaderRoute: typeof OnboardingRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/groups': {
      id: '/groups'
      path: '/groups'
      fullPath: '/groups'
      preLoaderRoute: typeof GroupsRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/create': {
      id: '/create'
      path: '/create'
      fullPath: '/create'
      preLoaderRoute: typeof CreateRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/auth': {
      id: '/auth'
      path: '/auth'
      fullPath: '/auth'
      preLoaderRoute: typeof AuthRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/assignments': {
      id: '/assignments'
      path: '/assignments'
      fullPath: '/assignments'
      preLoaderRoute: typeof AssignmentsRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/': {
      id: '/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof IndexRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/view/$id': {
      id: '/view/$id'
      path: '/view/$id'
      fullPath: '/view/$id'
      preLoaderRoute: typeof ViewIdRouteImport
      parentRoute: typeof rootRouteImport
    }
  }
}

const rootRouteChildren: RootRouteChildren = {
  IndexRoute: IndexRoute,
  AssignmentsRoute: AssignmentsRoute,
  AuthRoute: AuthRoute,
  CreateRoute: CreateRoute,
  GroupsRoute: GroupsRoute,
  OnboardingRoute: OnboardingRoute,
  ViewIdRoute: ViewIdRoute,
}
export const routeTree = rootRouteImport
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()

import type { getRouter } from './router.tsx'
import type { startInstance } from './start.ts'
declare module '@tanstack/react-start' {
  interface Register {
    ssr: true
    router: Awaited<ReturnType<typeof getRouter>>
    config: Awaited<ReturnType<typeof startInstance.getOptions>>
  }
}
