import request from '@/request'

/** 创建用户 创建用户 POST /user/admin/add */
export async function addUser(body: API.UserAddRequest, options?: Record<string, unknown>) {
  return request<API.BaseResponseLong>('/user/admin/add', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 根据 ID 删除用户（仅管理员） 根据 ID 删除用户（仅管理员） POST /user/admin/delete */
export async function deleteUser(body: API.DeleteRequest, options?: Record<string, unknown>) {
  return request<API.BaseResponseBoolean>('/user/admin/delete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 根据 ID 获取用户（仅管理员） 根据 ID 获取用户（仅管理员） GET /user/admin/get */
export async function getUserById(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getUserByIdParams,
  options?: Record<string, unknown>
) {
  return request<API.BaseResponseUser>('/user/admin/get', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  })
}

/** 分页获取用户封装列表（仅管理员） 分页获取用户封装列表（仅管理员） POST /user/admin/list/users */
export async function listUserVoByPage(
  body: API.UserQueryRequest,
  options?: Record<string, unknown>
) {
  return request<API.BaseResponsePageUserVO>('/user/admin/list/users', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 根据 ID 更新用户（仅管理员） 根据 ID 更新用户（仅管理员） POST /user/admin/update */
export async function updateUser(body: API.UserUpdateRequest, options?: Record<string, unknown>) {
  return request<API.BaseResponseBoolean>('/user/admin/update', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 根据 ID 获取用户包装类 根据 ID 获取用户包装类 GET /user/get */
export async function getUserVoById(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getUserVOByIdParams,
  options?: Record<string, unknown>
) {
  return request<API.BaseResponseUserVO>('/user/get', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  })
}

/** 获取当前登录用户 获取当前登录用户 GET /user/get/login */
export async function getLoginUser(options?: Record<string, unknown>) {
  return request<API.BaseResponseLoginUserVO>('/user/get/login', {
    method: 'GET',
    ...(options || {}),
  })
}

/** 用户登录 用户登录 POST /user/login */
export async function userLogin(body: API.UserLoginRequest, options?: Record<string, unknown>) {
  return request<API.BaseResponseLoginUserVO>('/user/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** 用户登出 用户登出 POST /user/logout */
export async function userLogout(options?: Record<string, unknown>) {
  return request<API.BaseResponseBoolean>('/user/logout', {
    method: 'POST',
    ...(options || {}),
  })
}

/** 用户注册 用户注册 POST /user/register */
export async function userRegister(
  body: API.UserRegisterRequest,
  options?: Record<string, unknown>
) {
  return request<API.BaseResponseLong>('/user/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}
