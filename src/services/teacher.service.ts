import { apiRequest } from "./api";

export type BackendTeacherCourse = {
  id: string | number;
  title: string;
  slug?: string;
  description?: string;
  price?: number;
  published?: boolean;
  categoryId?: number | null;
  createdBy?: string | number;
  createdAt?: string;
  updatedAt?: string;
};

export type BackendCourseEnrollment = {
  id: string | number;
  userId: string | number;
  courseId: string | number;
  status: string;
  progressPercent: number;
  enrolledAt?: string;
  User?: {
    id: string | number;
    name?: string;
    username?: string;
    email?: string;
    role?: string;
  };
};

export type BackendTeacherLecture = {
  id: string | number;
  title: string;
  type: string;
  contentUrl?: string | null;
  duration?: number | null;
  order?: number | null;
  chapterId: string | number;
  createdAt?: string;
  updatedAt?: string;
};

export type BackendTeacherChapter = {
  id: string | number;
  title: string;
  order?: number | null;
  courseId: string | number;
  Lectures?: BackendTeacherLecture[];
  createdAt?: string;
  updatedAt?: string;
};

export type TeacherCourseContentResponse = {
  course: BackendTeacherCourse;
  chapters: BackendTeacherChapter[];
};

export type BackendOwnerCourse = {
  id: string | number;
  title: string;
  slug?: string;
  description?: string;
  imageUrl?: string | null;
  level?: string | null;
  price?: number | string | null;
  published?: boolean;
  categoryId?: number | null;
  createdBy?: string | number;
  duration?: string | null;
  willLearn?: string[];
  requirements?: string[];
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
};

export type CreateTeacherCourseInput = {
  title: string;
  description?: string;
  price?: number;
  categoryId?: number | null;
  published?: boolean;
  level?: string;
  duration?: string;
  willLearn?: string[];
  requirements?: string[];
  tags?: string[];
};

export const teacherService = {
  async listMyCourses(): Promise<BackendTeacherCourse[]> {
    const data = await apiRequest<{ courses: BackendTeacherCourse[] }>("teacher/courses", {
      method: "GET",
    });

    return data.courses || [];
  },

  async getCourseEnrollments(courseId: string): Promise<BackendCourseEnrollment[]> {
    const data = await apiRequest<{ enrollments: BackendCourseEnrollment[] }>(
      `teacher/courses/${courseId}/enrollments`,
      {
        method: "GET",
      },
    );

    return data.enrollments || [];
  },

  async getCourseForOwner(courseId: string): Promise<BackendOwnerCourse> {
    const data = await apiRequest<{ course: BackendOwnerCourse }>(`teacher/courses/${courseId}`, {
      method: "GET",
    });

    return data.course;
  },

  async createCourse(input: CreateTeacherCourseInput): Promise<BackendTeacherCourse> {
    const data = await apiRequest<{ course: BackendTeacherCourse }>("teacher/courses", {
      method: "POST",
      body: JSON.stringify({
        title: input.title,
        description: input.description,
        price: input.price ?? 0,
        categoryId: input.categoryId ?? null,
        published: Boolean(input.published),
        level: input.level,
        duration: input.duration,
        willLearn: input.willLearn || [],
        requirements: input.requirements || [],
        tags: input.tags || [],
      }),
    });

    return data.course;
  },

  async updateCourse(courseId: string, input: Partial<CreateTeacherCourseInput>): Promise<BackendOwnerCourse> {
    const data = await apiRequest<{ course: BackendOwnerCourse }>(`teacher/courses/${courseId}`, {
      method: "PUT",
      body: JSON.stringify({
        title: input.title,
        description: input.description,
        price: input.price,
        categoryId: input.categoryId,
        published: input.published,
        level: input.level,
        duration: input.duration,
        willLearn: input.willLearn,
        requirements: input.requirements,
        tags: input.tags,
      }),
    });

    return data.course;
  },

  async getCourseContent(courseId: string): Promise<TeacherCourseContentResponse> {
    const data = await apiRequest<TeacherCourseContentResponse>(`teacher/courses/${courseId}/chapters`, {
      method: "GET",
    });

    return data;
  },

  async createChapter(params: { courseId: string; title: string; order?: number }): Promise<BackendTeacherChapter> {
    const data = await apiRequest<{ chapter: BackendTeacherChapter }>(`teacher/courses/${params.courseId}/chapters`, {
      method: "POST",
      body: JSON.stringify({
        title: params.title,
        order: params.order,
      }),
    });

    return data.chapter;
  },

  async updateChapter(params: { chapterId: string; title?: string; order?: number }): Promise<BackendTeacherChapter> {
    const data = await apiRequest<{ chapter: BackendTeacherChapter }>(`teacher/chapters/${params.chapterId}`, {
      method: "PUT",
      body: JSON.stringify({
        title: params.title,
        order: params.order,
      }),
    });

    return data.chapter;
  },

  async deleteChapter(chapterId: string): Promise<void> {
    await apiRequest<unknown>(`teacher/chapters/${chapterId}`, {
      method: "DELETE",
    });
  },

  async createLecture(params: {
    chapterId: string;
    title: string;
    type: string;
    contentUrl?: string;
    duration?: number;
    order?: number;
    file?: File;
  }): Promise<BackendTeacherLecture> {
    const form = new FormData();
    form.set("title", params.title);
    form.set("type", params.type);
    if (params.contentUrl != null) form.set("contentUrl", params.contentUrl);
    if (params.duration != null) form.set("duration", String(params.duration));
    if (params.order != null) form.set("order", String(params.order));
    if (params.file) form.set("file", params.file);

    const data = await apiRequest<{ lecture: BackendTeacherLecture }>(`teacher/chapters/${params.chapterId}/lectures`, {
      method: "POST",
      body: form,
    });

    return data.lecture;
  },

  async updateLecture(params: {
    lectureId: string;
    title?: string;
    type?: string;
    contentUrl?: string;
    duration?: number;
    order?: number;
    file?: File;
  }): Promise<BackendTeacherLecture> {
    const useForm = Boolean(params.file);
    const body = useForm ? (() => {
      const form = new FormData();
      if (params.title != null) form.set("title", params.title);
      if (params.type != null) form.set("type", params.type);
      if (params.contentUrl != null) form.set("contentUrl", params.contentUrl);
      if (params.duration != null) form.set("duration", String(params.duration));
      if (params.order != null) form.set("order", String(params.order));
      if (params.file) form.set("file", params.file);
      return form;
    })() : JSON.stringify({
      title: params.title,
      type: params.type,
      contentUrl: params.contentUrl,
      duration: params.duration,
      order: params.order,
    });

    const data = await apiRequest<{ lecture: BackendTeacherLecture }>(`teacher/lectures/${params.lectureId}`, {
      method: "PUT",
      body,
      ...(useForm ? {} : { headers: { "Content-Type": "application/json" } }),
    });

    return data.lecture;
  },

  async deleteLecture(lectureId: string): Promise<void> {
    await apiRequest<unknown>(`teacher/lectures/${lectureId}`, {
      method: "DELETE",
    });
  },
};
