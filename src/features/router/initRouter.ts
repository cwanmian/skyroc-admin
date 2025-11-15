import type { RouteObject } from 'react-router-dom';

import { authRoutes } from '@/router';
import { fetchGetUserInfo, fetchGetUserRoutes } from '@/service/api';
import { QUERY_KEYS } from '@/service/keys';
import { queryClient } from '@/service/queryClient';
import { store } from '@/store';

import { setHomePath } from './routeStore';
import { filterAuthRoutesByDynamic, filterAuthRoutesByRoles, mergeValuesByParent } from './shared';

export async function initAuthRoutes(addRoutes: (parent: string | null, route: RouteObject[]) => void) {
  const authRouteMode = import.meta.env.VITE_AUTH_ROUTE_MODE;

  const reactAuthRoutes = mergeValuesByParent(authRoutes);

  const userInfo = await queryClient.ensureQueryData<Api.Auth.UserInfo>({
    queryFn: fetchGetUserInfo,
    queryKey: QUERY_KEYS.AUTH.USER_INFO
  });

  const isSuper = userInfo?.roles.includes(import.meta.env.VITE_STATIC_SUPER_ROLE);

  // 静态模式
  if (authRouteMode === 'static') {
    // 超级管理员
    if (isSuper) {
      reactAuthRoutes.forEach(route => {
        addRoutes(route.parent, route.route);
      });
    } else {
      // 非超级管理员
      const filteredRoutes = filterAuthRoutesByRoles(reactAuthRoutes, userInfo?.roles || []);

      filteredRoutes.forEach(({ parent, route }) => {
        addRoutes(parent, route);
      });
    }
  } else {
    // 动态模式
    try {
      const data = await fetchGetUserRoutes();
      store.dispatch(setHomePath(data.home));

      const filteredRoutes = filterAuthRoutesByDynamic(reactAuthRoutes, data.routes);

      filteredRoutes.forEach(({ parent, route }) => {
        addRoutes(parent, route);
      });
    } catch (error) {
      console.error(error);
    }
  }
}
