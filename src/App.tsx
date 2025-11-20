import { RouterProvider } from '@/features/router';
import { fetchGetUserInfo } from '@/service/api/auth.ts';
import { QUERY_KEYS } from '@/service/keys/index.ts';
import { queryClient } from '@/service/queryClient';

import { LazyAnimate } from './features/animate';
import { AntdContextHolder, AntdProvider } from './features/antdConfig';
import { LangProvider } from './features/lang';
import { ThemeProvider } from './features/theme';
import { localStg } from './utils/storage';

const hasToken = Boolean(localStg.get('token'));

if (hasToken) {
  queryClient.prefetchQuery({
    queryFn: fetchGetUserInfo,
    queryKey: QUERY_KEYS.AUTH.USER_INFO
  });
}

const App = () => (
  <ThemeProvider>
    <LangProvider>
      <AntdProvider>
        <AntdContextHolder>
          <LazyAnimate>
            <RouterProvider />
          </LazyAnimate>
        </AntdContextHolder>
      </AntdProvider>
    </LangProvider>
  </ThemeProvider>
);

export default App;
