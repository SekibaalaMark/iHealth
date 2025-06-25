import { apiClient } from "./client";
import { request } from "@/features/auth/lib/allauth";
import { getCSRFToken } from "@/features/auth/lib/django";
import { API_URL } from "./constants";

// export const paginatedQuery = (
//   queryFn,
//   { page, size},
//   ...args
// ) => {
//   return queryFn(...args, {params: paginate(page, size)});
// };

export const paginate = (page, size = 10) => ({
  limit: size,
  offset: page * size,
});

/*
 *  Issues API
 */
export const fetchIssues = async ({ id, params } = {}) => {
  const url = id === undefined ? "/issues" : `/issues/${id}`;
  return await apiClient.get(url, { params }).then((response) => {
    // console.log({...params,data:response.data.data})
    return response.data;
  });
};

export const fetchIssuesMeta = async ({ params } = {}) => {
  return await apiClient.get("/issues/meta", { params }).then((response) => {
    return response.data;
  });
};

export const fetchIssue = async (id) => {
  return fetchIssues({ id });
};

export const createIssue = async (issue) => {
  return await apiClient
    .post("/issues", issue, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    .then((response) => {
      return response.data;
    });
};

export const updateIssue = async ({id, issue}) => {
  return await apiClient.put(`/issues/${id === undefined ? issue.id : id}`, issue).then((response) => {
    return response.data;
  });
};

export const deleteIssue = async (id) => {
  return await apiClient.delete(`/issues/${id}`).then((response) => {
    return response.data;
  });
};

export const searchIssue = async (search) => {
  const searchParams = new URLSearchParams(search).toString();
  const qp = searchParams ? `?${searchParams}` : "";
  return apiClient.get(`/search${qp}`).then((response) => response.data);
};

export const fetchStats = async ({ stat, params }) => {
  // console.log({params})
  const url = stat === undefined ? "/stats" : `/stats/${stat}`;
  return await apiClient.get(url, { params }).then((response) => response.data);
};

/*
 *  Users API
 */
export const fetchUsers = async ({ endpoint, params } = {}) => {
  const url = endpoint === undefined ? "/users" : `/users/${endpoint}`;
  return await apiClient.get(url, { params }).then((response) => {
    return response.data;
  });
};

export const updateUser = async ({ id, ...data }) => {
  const url = `/users/${id}`;
  return await apiClient.patch(url, data).then((response) => {
    return response.data;
  });
};

export const fetchRoles = async () => {
  return await apiClient.get("/users/roles").then((response) => {
    return response.data;
  });
};

export const createToken = async (data) => {
  // console.log({POST: data})
  return await apiClient
    .post("/reference-token", data, {
      withCredentials: true,
      headers: {
        "X-CSRFToken": getCSRFToken(),
        "Content-Type": "application/json",
      },
    })
    .then((response) => {
      return response.data;
    });
};
// export async function createToken (data) {
//   return await request('POST', "/reference-token", data)
// }

export const fetchTokens = async ({ params } = {}) => {
  return await apiClient.get("/reference-token", { params }).then((response) => {
    return response.data;
  });
};

export const fetchToken = async (id) => {
  return await apiClient.get(`/reference-token/${id}`).then((response) => {
    return response.data;
  });
};


/*
 *  Course Units API
 */

// export const fetchCourses = async ({ params } = {}) => {
//   return await apiClient.get("/courses", { params }).then((response) => {
//     return response.data;
//   });
// };

export const enrollToCourses = async ({ studentId, courses } = {}) => {
  return await apiClient.put(`/users/${studentId}/courses`, { courses: courses }).then((response) => {
    return response.data;
  });
};

export const fetchCourses = async () => {
  return await apiClient.get(`/courses`).then((response) => {
    return response.data;
  });
};

export const createCourse = async (data) => {
  return await apiClient.post(`/courses`, data).then((response) => {
    return response.data;
  });
};

export const updateCourse = async ({id, ...data}) => {
  return await apiClient.put(`/courses/${id}`, data).then((response) => {
    return response.data;
  });
};

export const deleteCourse = async (id) => {
  return await apiClient.delete(`/courses/${id}`).then((response) => {
    return response.data;
  });
};

export const assignCourse = async (data) => {
  return await apiClient.put(`/users/staff`, data).then((response) => {
    return response.data;
  });
};

// export const fetchtCourseUnits = async () => {
//   return await apiClient.get(`/courses/${courseId}`).then((response) => {
//     return response.data;
//   });
// };

/*
 *  Course Units API
 */

export const fetchFaculties = async (config) => {
  return await apiClient.get(`/faculties`, config).then((response) => {
    return response.data;
  });
};

export const createFaculty = async (data) => {
  return await apiClient.post(`/faculties`, data).then((response) => {
    return response.data;
  });
};

export const updateFaculty = async ({id, ...data}) => {
  return await apiClient.put(`/faculties/${id}`, data).then((response) => {
    return response.data;
  });
};

export const fetchDepartments = async (config) => {
  return await apiClient.get(`/departments`, config).then((response) => {
    return response.data;
  });
};
