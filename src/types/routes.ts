export const ROUTES = {
  HOME: '/',
  POSTS: '/posts',
  POST_DETAIL: (id: string) => `/post/${id}`,
  WRITE: '/write',
  EDIT: (id: string) => `/edit/${id}`,
  LOGIN: '/login',
  MY_POSTS: '/my-posts',
  TEAM: '/team',
  CONTACT: '/contact',
  COMING_SOON: '/comingsoon',

  ADMIN: '/admin',
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_POSTS: '/admin/posts',
  ADMIN_WHITELIST: '/admin/whitelist',
  ADMIN_HOME_SCREEN: '/admin/home-screen',
  ADMIN_SETTINGS: '/admin/settings',
  ADMIN_TAGS: '/admin/tags',

  PROFILE: '/profile',
  PROFILE_EDIT: '/profile/edit',
  PROFILE_PASSWORD: '/profile/password',
};
